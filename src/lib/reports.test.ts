import { describe, it, expect } from 'vitest';
import { reportWeek, weeklyReport, focusChange } from './reports';
describe('weekly reports', () => {
  const start = new Date(2026, 9, 26);
  it('starts on Monday and includes seven days', () => { const w = reportWeek(0, new Date(2026, 10, 1, 18)); expect(w.start.getTime()).toBe(start.getTime()); expect(w.end.getDate()).toBe(2); });
  it('counts completed focus pomodoros, not breaks or the next week', () => { const r = weeklyReport([{minutes:60,mode:'focus',completed_at:new Date(2026,9,26,10).toISOString()},{minutes:5,mode:'shortBreak',completed_at:new Date(2026,9,26,11).toISOString()},{minutes:25,mode:'focus',completed_at:new Date(2026,10,2).toISOString()}],[],start); expect(r.minutes).toBe(60); expect(r.pomodoros).toBe(1); expect(r.days[0].minutes).toBe(60); });
  it('counts tasks only on their known completion date', () => { const r = weeklyReport([],[{done:true,completed_at:new Date(2026,9,27,14).toISOString()},{done:true,completed_at:null},{done:false,completed_at:new Date(2026,9,27,15).toISOString()}],start); expect(r.tasks).toBe(1); expect(r.days[1].tasks).toBe(1); });
  it('returns seven empty days without invented data', () => { const r=weeklyReport([],[],start); expect(r.days).toHaveLength(7); expect(r.minutes).toBe(0); expect(r.activeDays).toBe(0); });
  it('compares weeks without dividing by zero', () => { expect(focusChange(120,60)).toBe(100); expect(focusChange(30,60)).toBe(-50); expect(focusChange(60,0)).toBeNull(); });
});
