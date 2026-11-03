import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { toast } from "sonner";
import { TimerMode, PomodoroSettings, DEFAULT_SETTINGS, minutesForMode, remainingSeconds, elapsedWholeMinutes } from "@/lib/pomodoro";
import { useSettings, useRecordSession, useFocusPreferences, DEFAULT_FOCUS_PREFERENCES } from "@/hooks/useAppData";
import { useSessionAlerts } from "@/hooks/useSessionAlerts";
import { startMusic, stopMusic, playAlarm, unlockAudio } from "@/lib/focusAudio";
import { CompletionModal } from "@/components/timer/CompletionModal";

interface TimerState {
  settings: PomodoroSettings;
  mode: TimerMode;
  taskId: string | null;
  minutes: number;
  seconds: number;
  progress: number;
  isRunning: boolean;
  isFresh: boolean;
  isCompleted: boolean;
  musicOn: boolean;
  setMode: (m: TimerMode) => void;
  setTaskId: (id: string | null) => void;
  setMusicOn: (v: boolean) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  stop: () => void;
}

const Ctx = createContext<TimerState | null>(null);

/** Timer lives above the router so navigation never resets it. */
export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const { data: saved } = useSettings();
  const settings = saved ?? DEFAULT_SETTINGS;
  const { data: preferences = DEFAULT_FOCUS_PREFERENCES } = useFocusPreferences();
  const alerts = useSessionAlerts(preferences);
  const record = useRecordSession();

  const [mode, setModeState] = useState<TimerMode>("focus");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [musicOn, setMusicOnState] = useState(() => localStorage.getItem("ft-music") !== "off");
  const total = Math.max(1, Math.round(minutesForMode(mode, settings) * 60));
  const [secondsLeft, setSecondsLeft] = useState(total);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [earned, setEarned] = useState<number | null>(null);

  const ref = useRef({ mode, taskId, total, settings });
  ref.current = { mode, taskId, total, settings };

  // Sync the display when the duration changes while idle.
  useEffect(() => { if (endAt === null) setSecondsLeft(total); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [total]);

  const isRunning = endAt !== null;

  // Background music only during running focus.
  useEffect(() => {
    if (isRunning && mode === "focus" && musicOn) startMusic(); else stopMusic();
  }, [isRunning, mode, musicOn]);
  useEffect(() => () => stopMusic(), []);

  const save = useCallback((minutes: number, sessionMode: TimerMode, tid: string | null, completed: boolean) => {
    record.mutate({ taskId: sessionMode === "focus" ? tid : null, minutes, mode: sessionMode }, {
      onSuccess: () => {
        if (sessionMode !== "focus") return void toast.success("Pausa concluída.");
        if (completed) {
          if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
          setEarned(minutes);
        } else toast.success(`${minutes} min de foco salvos.`);
      },
      onError: () => toast.error("Não foi possível salvar a sessão."),
    });
  }, [record]);

  useEffect(() => {
    if (endAt === null) return;
    const tick = () => {
      const left = remainingSeconds(endAt, Date.now());
      setSecondsLeft(left);
      if (left === 0) {
        setEndAt(null);
        const { mode: m, taskId: t, settings: s } = ref.current;
        playAlarm(5);
        alerts.notify(m, true);
        save(minutesForMode(m, s), m, t, true);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endAt]);

  const start = useCallback(() => {
    unlockAudio();
    alerts.unlock();
    const secs = secondsLeft > 0 ? secondsLeft : total;
    setSecondsLeft(secs);
    setEndAt(Date.now() + secs * 1000);
    alerts.notify(mode, false);
  }, [secondsLeft, total, mode, alerts]);

  const pause = useCallback(() => {
    if (endAt) setSecondsLeft(remainingSeconds(endAt, Date.now()));
    setEndAt(null);
  }, [endAt]);
  const reset = useCallback(() => { setEndAt(null); setSecondsLeft(total); }, [total]);

  const stop = useCallback(() => {
    const left = endAt ? remainingSeconds(endAt, Date.now()) : secondsLeft;
    setEndAt(null);
    setSecondsLeft(total);
    if (mode !== "focus") return;
    const minutes = elapsedWholeMinutes(total, left);
    if (minutes < 1) return void toast("Menos de 1 minuto de foco — nada foi salvo.");
    save(minutes, mode, taskId, false);
  }, [endAt, secondsLeft, total, mode, taskId, save]);

  const setMode = (m: TimerMode) => { if (!isRunning) setModeState(m); };
  const setMusicOn = (v: boolean) => { localStorage.setItem("ft-music", v ? "on" : "off"); setMusicOnState(v); };

  const value: TimerState = {
    settings, mode, taskId, musicOn,
    minutes: Math.floor(secondsLeft / 60), seconds: secondsLeft % 60,
    progress: ((total - secondsLeft) / total) * 100,
    isRunning, isFresh: !isRunning && secondsLeft === total, isCompleted: !isRunning && secondsLeft === 0,
    setMode, setTaskId, setMusicOn, start, pause, reset, stop,
  };

  return <Ctx.Provider value={value}>
    {children}
    <CompletionModal open={earned !== null} onClose={() => setEarned(null)} earnedStardust={earned ?? 0} />
  </Ctx.Provider>;
};

export const useGlobalTimer = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGlobalTimer must be used inside TimerProvider");
  return v;
};
