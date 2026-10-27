CREATE TABLE public.goals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(), title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 120), horizon text NOT NULL DEFAULT 'short' CHECK (horizon IN ('short','medium','long')), target_minutes integer NOT NULL DEFAULT 100 CHECK (target_minutes > 0), due_date date, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals" ON public.goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TABLE public.focus_preferences (
 user_id uuid PRIMARY KEY DEFAULT auth.uid(), daily_minutes integer NOT NULL DEFAULT 100 CHECK (daily_minutes > 0), weekly_minutes integer NOT NULL DEFAULT 500 CHECK (weekly_minutes > 0), sound_enabled boolean NOT NULL DEFAULT false, notifications_enabled boolean NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.focus_preferences TO authenticated;
GRANT ALL ON public.focus_preferences TO service_role;
ALTER TABLE public.focus_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own focus preferences" ON public.focus_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
ALTER TABLE public.tasks ADD COLUMN goal_id uuid REFERENCES public.goals(id) ON DELETE SET NULL;
CREATE INDEX tasks_goal_id_idx ON public.tasks(goal_id);
CREATE FUNCTION public.validate_task_goal_owner() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NEW.goal_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.goals g WHERE g.id = NEW.goal_id AND g.user_id = NEW.user_id) THEN RAISE EXCEPTION 'Goal must belong to task owner'; END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER validate_task_goal_owner BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.validate_task_goal_owner();