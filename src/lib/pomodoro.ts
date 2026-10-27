export type TimerMode = "focus" | "short-break" | "long-break";

export interface PomodoroSettings {
  focus_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focus_minutes: 25,
  short_break_minutes: 5,
  long_break_minutes: 15,
};

export const INVALID_FOCUS_MESSAGE = "Tempo inválido. O tempo de foco deve ser maior que zero.";

/** Returns an error message or null when the settings are valid. */
export const validateSettings = (s: PomodoroSettings): string | null => {
  if (!Number.isFinite(s.focus_minutes) || s.focus_minutes <= 0) return INVALID_FOCUS_MESSAGE;
  if (!Number.isFinite(s.short_break_minutes) || s.short_break_minutes <= 0)
    return "Tempo inválido. A pausa curta deve ser maior que zero.";
  if (!Number.isFinite(s.long_break_minutes) || s.long_break_minutes <= 0)
    return "Tempo inválido. A pausa longa deve ser maior que zero.";
  return null;
};

export const minutesForMode = (mode: TimerMode, s: PomodoroSettings) =>
  mode === "focus" ? s.focus_minutes : mode === "short-break" ? s.short_break_minutes : s.long_break_minutes;

export const statusForMode = (mode: TimerMode) =>
  mode === "focus" ? "Em Foco" : mode === "short-break" ? "Em Pausa" : "Descanso";

/** Seconds left until endAt, never negative, rounded up so 30:00 shows at start. */
export const remainingSeconds = (endAt: number, now: number) => Math.max(0, Math.ceil((endAt - now) / 1000));

export const addFocusMinutes = (completed: number, add: number) => completed + Math.max(0, add);

export const taskProgress = (completed: number, estimated: number) =>
  estimated > 0 ? Math.min(100, (completed / estimated) * 100) : 0;
