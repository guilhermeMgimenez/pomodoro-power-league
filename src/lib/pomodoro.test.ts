import { describe, it, expect } from "vitest";
import {
  validateSettings, INVALID_FOCUS_MESSAGE, remainingSeconds, addFocusMinutes, minutesForMode, DEFAULT_SETTINGS,
} from "./pomodoro";

describe("pomodoro rules", () => {
  it("rejects zero focus time with the UC01 message", () => {
    expect(validateSettings({ ...DEFAULT_SETTINGS, focus_minutes: 0 })).toBe(INVALID_FOCUS_MESSAGE);
  });
  it("rejects negative focus time", () => {
    expect(validateSettings({ ...DEFAULT_SETTINGS, focus_minutes: -5 })).toBe(INVALID_FOCUS_MESSAGE);
  });
  it("accepts a 30 minute focus and starts at 30:00", () => {
    const s = { ...DEFAULT_SETTINGS, focus_minutes: 30 };
    expect(validateSettings(s)).toBeNull();
    const start = 1_000_000;
    expect(remainingSeconds(start + minutesForMode("focus", s) * 60_000, start)).toBe(1800);
  });
  it("counts by end time even if ticks were skipped", () => {
    const start = 0;
    expect(remainingSeconds(start + 1500_000, start + 600_000)).toBe(900);
    expect(remainingSeconds(start + 1500_000, start + 9_999_999)).toBe(0);
  });
  it("adds 25 focus minutes to a task with 60 done -> 85", () => {
    expect(addFocusMinutes(60, 25)).toBe(85);
  });
  it("quick start defaults are 25/5/15", () => {
    expect(DEFAULT_SETTINGS).toEqual({ focus_minutes: 25, short_break_minutes: 5, long_break_minutes: 15 });
  });
});

import { elapsedWholeMinutes } from "./pomodoro";
describe("elapsedWholeMinutes", () => {
  it("keeps 5 minutes when stopping a 10-minute timer halfway", () => {
    expect(elapsedWholeMinutes(600, 300)).toBe(5);
  });
  it("ignores partial minutes", () => {
    expect(elapsedWholeMinutes(600, 545)).toBe(0);
  });
});
