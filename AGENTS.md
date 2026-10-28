# AGENTS.md

- Backend is Lovable Cloud; every user table has RLS scoped to `auth.uid()` — data is private per user.
- Auth state comes only from `AuthProvider` (`src/contexts/AuthContext.tsx`); internal routes are wrapped in `ProtectedRoute` so signed-out users land on `/`.
- Data access lives in `src/hooks/useAppData.ts` (React Query); pages never call the client directly — one place to change queries.
- Pomodoro rules (validation, time math, task progress) are pure functions in `src/lib/pomodoro.ts` with vitest tests next to them — keeps rules testable.
- The timer counts down from an absolute end time, never by decrementing per tick — background tabs throttle intervals.
- Completing a focus session goes through the `record_focus_session` DB function so the session row and task progress update together.
- Desktop-first for now; mobile-only features (PWA, push, Wake Lock) are deferred by the team.
- Goal progress aggregates completed minutes of currently linked tasks; period targets count focus sessions from local midnight or Monday — breaks never count.
- Task-to-goal ownership is validated by a database trigger in addition to owner-scoped RLS — links must not cross users.
- Session alerts are opt-in browser audio and notifications; zen uses fullscreen without navigation so the timer stays mounted.
- Reports aggregate local Monday-to-Monday weeks from focus sessions and server-stamped task completion dates; legacy undated completions remain undated rather than fabricated.
- Lovable AI insights run in an authenticated edge function that queries owner-scoped data, caches each week/timezone, and persists terminal credit/access failures; refresh requires explicit user action.
- Gamification rules (Stardust = focus minutes, constellation = consecutive local days, moon phase thresholds, ranking) are pure functions in `src/lib/gamification.ts` with tests.
- Friends see each other only through security-definer functions that expose name and weekly Stardust; invites are sent by exact e-mail via `send_friend_request`, never by listing users.
