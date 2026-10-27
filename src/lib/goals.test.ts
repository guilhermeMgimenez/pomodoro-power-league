import { describe, expect, it } from "vitest";
import { focusPeriodStarts, goalMinutes, periodFocusMinutes, validateMinuteTarget } from "./goals";

describe("metas e períodos", () => {
  it("soma apenas o foco das tarefas vinculadas à meta", () => {
    expect(goalMinutes("java", [{ goal_id: "java", completed_minutes: 60 }, { goal_id: "java", completed_minutes: 25 }, { goal_id: "other", completed_minutes: 100 }])).toBe(85);
  });
  it("não aceita uma meta de zero minutos", () => {
    expect(validateMinuteTarget(0)).toBe(false);
    expect(validateMinuteTarget(100)).toBe(true);
    expect(validateMinuteTarget(0.5)).toBe(false);
  });
  it("inicia a semana na segunda-feira local, inclusive aos domingos", () => {
    const { day, week } = focusPeriodStarts(new Date(2026, 10, 1, 15));
    expect(day.getHours()).toBe(0);
    expect(week.getDay()).toBe(1);
    expect(week.getDate()).toBe(26);
    expect(week.getMonth()).toBe(9);
  });
  it("não soma pausas nem foco fora do período", () => {
    const sessions = [
      { mode: "focus", minutes: 25, completed_at: "2026-10-27T12:00:00Z" },
      { mode: "short-break", minutes: 5, completed_at: "2026-10-27T12:05:00Z" },
      { mode: "focus", minutes: 50, completed_at: "2026-10-26T12:00:00Z" },
    ];
    expect(periodFocusMinutes(sessions, new Date("2026-10-27T00:00:00Z"), new Date("2026-10-28T00:00:00Z"))).toBe(25);
    expect(periodFocusMinutes(sessions, new Date("2026-10-26T00:00:00Z"), new Date("2026-10-28T00:00:00Z"))).toBe(75);
  });
});