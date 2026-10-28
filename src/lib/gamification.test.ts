import { describe, expect, it } from "vitest";
import { constellation, moonPhase, rankLeaderboard, stardust } from "./gamification";

const at = (y: number, m: number, d: number, h = 10) => new Date(y, m, d, h).toISOString();

describe("gamification", () => {
  it("stardust counts only focus minutes", () => {
    expect(stardust([{ minutes: 25, mode: "focus" }, { minutes: 5, mode: "short" }, { minutes: 30, mode: "focus" }])).toBe(55);
  });

  it("moon phase follows stardust thresholds", () => {
    expect(moonPhase(0).name).toBe("Nova");
    expect(moonPhase(299)).toMatchObject({ name: "Nova", next: "Crescente", toNext: 1 });
    expect(moonPhase(1000).name).toBe("Cheia");
    expect(moonPhase(12000)).toMatchObject({ name: "Supernova", next: null });
  });

  it("constellation counts consecutive local days ending today", () => {
    const now = new Date(2026, 9, 27, 20);
    const s = [at(2026, 9, 27), at(2026, 9, 26), at(2026, 9, 25), at(2026, 9, 23)].map((completed_at) => ({ completed_at, mode: "focus" }));
    expect(constellation(s, now)).toBe(3);
  });

  it("constellation survives until today ends and ignores breaks", () => {
    const now = new Date(2026, 9, 27, 8);
    expect(constellation([{ completed_at: at(2026, 9, 26), mode: "focus" }], now)).toBe(1);
    expect(constellation([{ completed_at: at(2026, 9, 27), mode: "short" }], now)).toBe(0);
    expect(constellation([{ completed_at: at(2026, 9, 25), mode: "focus" }], now)).toBe(0);
  });

  it("leaderboard ranks by weekly stardust", () => {
    const r = rankLeaderboard([
      { user_id: "a", display_name: "Ana", stardust: 50, is_me: true },
      { user_id: "b", display_name: "Bia", stardust: 120, is_me: false },
    ]);
    expect(r.map((x) => [x.display_name, x.rank])).toEqual([["Bia", 1], ["Ana", 2]]);
  });
});
