import { useRef } from "react";
import { FocusPreferences } from "@/hooks/useAppData";
import { TimerMode } from "@/lib/pomodoro";

/** Audio is unlocked only by a user gesture; notifications require explicit permission. */
export const useSessionAlerts = (preferences: FocusPreferences) => {
  const audio = useRef<AudioContext | null>(null);
  const unlock = () => {
    if (!preferences.sound_enabled) return;
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume().catch(() => undefined);
    } catch { /* Audio unavailable: the timer still works. */ }
  };
  const notify = (mode: TimerMode, completed: boolean) => {
    const label = mode === "focus" ? "Foco" : "Pausa";
    if (preferences.sound_enabled && audio.current?.state === "running") {
      const ctx = audio.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = completed ? 660 : 440;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.65);
    }
    if (preferences.notifications_enabled && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Focus Time", { body: `${label} ${completed ? "concluído. Seu céu ganhou um novo momento." : "iniciado. Um momento para você."}`, tag: "focus-time-session" });
      } catch { /* Notification unavailable: completion remains visible in app. */ }
    }
  };
  return { unlock, notify };
};