import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTimer } from "@/hooks/useTimer";
import { TimerMode, PomodoroSettings, DEFAULT_SETTINGS, minutesForMode, statusForMode, taskProgress } from "@/lib/pomodoro";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { CompletionModal } from "@/components/timer/CompletionModal";
import { CurrentTask } from "@/components/timer/CurrentTask";
import { ModeSelector } from "@/components/timer/ModeSelector";
import { CycleDialog } from "@/components/timer/CycleDialog";
import { BottomNav } from "@/components/layout/BottomNav";
import { Star, Flame, Maximize, Minimize, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FocusOptionsDialog } from "@/components/timer/FocusOptionsDialog";
import { useSessionAlerts } from "@/hooks/useSessionAlerts";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings, useSaveSettings, useTasks, useRecordSession, usePeriodFocus, useFocusPreferences, DEFAULT_FOCUS_PREFERENCES } from "@/hooks/useAppData";
import { toast } from "sonner";

const Index = () => {
  const { data: savedSettings } = useSettings();
  const saveSettings = useSaveSettings();
  const { data: tasks = [] } = useTasks();
  const { data: periodFocus } = usePeriodFocus();
  const todayMinutes = periodFocus?.daily ?? 0;
  const { data: preferences = DEFAULT_FOCUS_PREFERENCES } = useFocusPreferences();
  const dailyGoal = preferences.daily_minutes;
  const alerts = useSessionAlerts(preferences);
  const recordSession = useRecordSession();

  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [cycleOpen, setCycleOpen] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [zen, setZen] = useState(false);
  const zenElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFullscreenChange = () => { if (!document.fullscreenElement) setZen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setZen(false); };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleZen = async () => {
    if (zen) {
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
      setZen(false);
    } else {
      setZen(true);
      await zenElement.current?.requestFullscreen?.().catch(() => toast("Modo zen ativado sem tela cheia."));
    }
  };

  useEffect(() => { if (savedSettings) setSettings(savedSettings); }, [savedSettings]);

  const openTasks = tasks.filter((t) => !t.done);
  useEffect(() => {
    if (!taskId && openTasks[0]) setTaskId(openTasks[0].id);
  }, [openTasks, taskId]);
  const currentTask = tasks.find((t) => t.id === taskId) ?? null;

  const handleComplete = () => {
    alerts.notify(mode, true);
    const minutes = minutesForMode(mode, settings);
    recordSession.mutate(
      { taskId: mode === "focus" ? taskId : null, minutes, mode },
      { onSuccess: () => {
        if (mode === "focus") {
          if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
          setZen(false);
          setEarnedXP(minutes); setShowCompletionModal(true);
        } else toast.success("Pausa concluída.");
      }, onError: () => toast.error("Não foi possível salvar a sessão.") },
    );
  };

  const { minutes, seconds, progress, isRunning, isFresh, isCompleted, start, startWith, pause, reset } = useTimer({
    initialMinutes: minutesForMode(mode, settings),
    onComplete: handleComplete,
  });

  const handleStart = () => {
    alerts.unlock();
    if (mode === "focus" && (isFresh || isCompleted)) setCycleOpen(true);
    else { start(); alerts.notify(mode, false); }
  };

  const handleCycleStart = (s: PomodoroSettings) => {
    alerts.unlock();
    alerts.notify("focus", false);
    setSettings(s);
    setMode("focus");
    setCycleOpen(false);
    startWith(s.focus_minutes);
    saveSettings.mutate(s, { onError: () => toast.error("O ciclo começou, mas as preferências não foram salvas.") });
  };

  const handleModeChange = (newMode: TimerMode) => {
    if (!isRunning) setMode(newMode);
  };

  return (
    <>
      <div ref={zenElement} className={zen ? "fixed inset-0 z-50 overflow-auto bg-background" : "min-h-screen bg-background pb-24"}>
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-semibold">{zen ? "Focus Time" : "Foco"}</h1>
            <div className="flex gap-2">
              {!zen && <Button size="icon" variant="ghost" aria-label="Alertas de sessão" title="Alertas de sessão" onClick={() => setOptionsOpen(true)}><Settings2 strokeWidth={1.5} className="w-5 h-5" /></Button>}
              <Button variant="outline" onClick={toggleZen} aria-label={zen ? "Sair do modo zen" : "Modo zen"}>{zen ? <Minimize className="w-4 h-4 mr-2" /> : <Maximize className="w-4 h-4 mr-2" />}{zen ? "Sair" : "Modo zen"}</Button>
            </div>
          </div>

          {!zen && <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Meta diária</span>
              <div className="text-right">
                <span className="font-display text-2xl font-semibold text-primary">{todayMinutes}/{dailyGoal}</span>
                <p className="text-sm text-muted-foreground">minutos de foco</p>
              </div>
            </div>
            <Progress value={taskProgress(todayMinutes, dailyGoal)} className="h-1.5" />
          </div>}

          <div className="flex justify-center">
            <ModeSelector currentMode={mode} onModeChange={handleModeChange} settings={settings} disabled={isRunning} />
          </div>

          <div className="flex justify-center py-4">
            <TimerDisplay
              minutes={minutes}
              seconds={seconds}
              progress={progress}
              mode={mode}
              status={isRunning ? statusForMode(mode) : isCompleted ? "Concluído" : isFresh ? "Pronto" : "Pausado"}
            />
          </div>

          <TimerControls isRunning={isRunning} onStart={handleStart} onPause={pause} onReset={reset} startLabel={isFresh || isCompleted ? "Iniciar" : "Continuar"} />

          {openTasks.length > 0 ? (
            <div className="space-y-3">
              <Select value={taskId ?? undefined} onValueChange={setTaskId} disabled={isRunning}>
                <SelectTrigger aria-label="Tarefa atual" className="h-11"><SelectValue placeholder="Escolha a tarefa" /></SelectTrigger>
                <SelectContent>
                  {openTasks.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                </SelectContent>
              </Select>
              {currentTask && (
                <CurrentTask
                  taskName={currentTask.title}
                  progress={taskProgress(currentTask.completed_minutes, currentTask.estimated_minutes)}
                  totalMinutes={currentTask.estimated_minutes}
                  completedMinutes={currentTask.completed_minutes}
                />
              )}
            </div>
          ) : (
            <div className="night-card p-5 text-sm text-muted-foreground">
              Nenhuma tarefa aberta. <Link to="/tarefas" className="text-primary font-semibold">Criar uma tarefa</Link>
            </div>
          )}

          {!zen && <div className="grid grid-cols-2 gap-4">
            <div className="night-card p-6">
              <div className="flex items-center gap-3 mb-2 text-reward">
                <Star strokeWidth={1.5} className="w-6 h-6" />
                <span className="text-sm text-muted-foreground">Pontuação diária</span>
              </div>
              <p className="font-display text-4xl font-bold">{todayMinutes}</p>
            </div>
            <div className="night-card p-6">
              <div className="flex items-center gap-3 mb-2 text-success">
                <Flame strokeWidth={1.5} className="w-6 h-6" />
                <span className="text-sm text-muted-foreground">Streak</span>
              </div>
              <p className="font-display text-4xl font-bold">5 dias</p>
            </div>
          </div>}
        </div>
      </div>

      {!zen && <BottomNav />}
      <FocusOptionsDialog open={optionsOpen} onOpenChange={setOptionsOpen} preferences={preferences} />

      <CycleDialog open={cycleOpen} initial={settings} onOpenChange={setCycleOpen} onStart={handleCycleStart} />
      <CompletionModal open={showCompletionModal} onClose={() => setShowCompletionModal(false)} earnedXP={earnedXP} earnedCoins={Math.round(earnedXP / 5)} />
    </>
  );
};

export default Index;
