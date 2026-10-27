export interface ReportSession { minutes: number; mode: string; completed_at: string }
export interface ReportTask { done: boolean; completed_at: string | null }
export function reportWeek(offset = 0, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7 + offset * 7);
  const end = new Date(start); end.setDate(end.getDate() + 7);
  const previous = new Date(start); previous.setDate(previous.getDate() - 7);
  return { start, end, previous };
}
export function weeklyReport(sessions: ReportSession[], tasks: ReportTask[], start: Date) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start); date.setDate(date.getDate() + i);
    const end = new Date(date); end.setDate(end.getDate() + 1);
    const focus = sessions.filter(s => s.mode === 'focus' && new Date(s.completed_at) >= date && new Date(s.completed_at) < end);
    return { date: date.toLocaleDateString('pt-BR'), label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), minutes: focus.reduce((sum, s) => sum + s.minutes, 0), pomodoros: focus.length, tasks: tasks.filter(t => t.done && t.completed_at && new Date(t.completed_at) >= date && new Date(t.completed_at) < end).length };
  });
  return { days, minutes: days.reduce((s, d) => s + d.minutes, 0), pomodoros: days.reduce((s, d) => s + d.pomodoros, 0), tasks: days.reduce((s, d) => s + d.tasks, 0), activeDays: days.filter(d => d.minutes > 0).length };
}
export function focusChange(current: number, previous: number) { return previous > 0 ? Math.round((current - previous) / previous * 100) : null; }
export function formatFocus(minutes: number) { return `${Math.floor(minutes / 60)}h ${minutes % 60}min`; }
