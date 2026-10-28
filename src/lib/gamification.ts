export const MOON_PHASES = [
  { name: "Nova", min: 0 },
  { name: "Crescente", min: 300 },
  { name: "Cheia", min: 1000 },
  { name: "Aurora", min: 2500 },
  { name: "Nebulosa", min: 5000 },
  { name: "Supernova", min: 10000 },
] as const;

/** Stardust = completed focus minutes. Breaks never count. */
export function stardust(sessions: { minutes: number; mode: string }[]): number {
  return sessions.filter((s) => s.mode === "focus").reduce((a, s) => a + s.minutes, 0);
}

export function moonPhase(points: number) {
  let index = 0;
  MOON_PHASES.forEach((p, i) => { if (points >= p.min) index = i; });
  const next = MOON_PHASES[index + 1];
  return { name: MOON_PHASES[index].name, index, next: next?.name ?? null, toNext: next ? next.min - points : 0 };
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Constellation = consecutive local days with a focus session, ending today (or yesterday, if today has none yet). */
export function constellation(sessions: { completed_at: string; mode: string }[], now = new Date()): number {
  const days = new Set(sessions.filter((s) => s.mode === "focus").map((s) => dayKey(new Date(s.completed_at))));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(dayKey(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); }
  return count;
}

export interface LeaderRow { user_id: string; display_name: string; stardust: number; is_me: boolean }

export function rankLeaderboard(rows: LeaderRow[]) {
  return [...rows]
    .sort((a, b) => b.stardust - a.stardust || a.display_name.localeCompare(b.display_name))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
