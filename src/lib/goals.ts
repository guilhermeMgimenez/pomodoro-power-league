export type GoalHorizon = "short" | "medium" | "long";
export const HORIZON_LABELS: Record<GoalHorizon, string> = {
  short: "Curto prazo", medium: "Médio prazo", long: "Longo prazo",
};

export const validateMinuteTarget = (value: number) => Number.isSafeInteger(value) && value > 0 && value <= 2147483647;

export const goalMinutes = (goalId: string, tasks: { goal_id: string | null; completed_minutes: number }[]) =>
  tasks.filter((task) => task.goal_id === goalId).reduce((sum, task) => sum + task.completed_minutes, 0);

/** Week starts on Monday in the user's local timezone. */
export const focusPeriodStarts = (now = new Date()) => {
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  const week = new Date(day);
  week.setDate(week.getDate() - (week.getDay() + 6) % 7);
  return { day, week };
};

export const periodFocusMinutes = (sessions: { mode: string; minutes: number; completed_at: string }[], start: Date, end = new Date()) =>
  sessions.filter((s) => s.mode === "focus" && new Date(s.completed_at) >= start && new Date(s.completed_at) <= end)
    .reduce((sum, s) => sum + s.minutes, 0);