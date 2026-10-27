# AGENTS.md

- Backend is Lovable Cloud; every user table has RLS scoped to `auth.uid()` — data is private per user.
- Auth state comes only from `AuthProvider` (`src/contexts/AuthContext.tsx`); internal routes are wrapped in `ProtectedRoute` so signed-out users land on `/`.
- Data access lives in `src/hooks/useAppData.ts` (React Query); pages never call the client directly — one place to change queries.
- Pomodoro rules (validation, time math, task progress) are pure functions in `src/lib/pomodoro.ts` with vitest tests next to them — keeps rules testable.
- The timer counts down from an absolute end time, never by decrementing per tick — background tabs throttle intervals.
- Completing a focus session goes through the `record_focus_session` DB function so the session row and task progress update together.
- Desktop-first for now; mobile-only features (PWA, push, Wake Lock) are deferred by the team.
