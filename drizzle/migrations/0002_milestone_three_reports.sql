ALTER TABLE public.tasks ADD COLUMN completed_at timestamptz;
CREATE FUNCTION public.track_task_completion() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.completed_at := CASE WHEN NEW.done THEN now() ELSE NULL END;
  ELSIF NEW.done IS DISTINCT FROM OLD.done THEN
    NEW.completed_at := CASE WHEN NEW.done THEN now() ELSE NULL END;
  ELSE
    NEW.completed_at := OLD.completed_at;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER task_completion_timestamp BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.track_task_completion();
CREATE INDEX focus_sessions_owner_date ON public.focus_sessions (user_id, completed_at);
CREATE TABLE public.focus_insights (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  week_start timestamptz NOT NULL,
  timezone text NOT NULL,
  advice jsonb,
  error_message text,
  error_status integer,
  generated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week_start, timezone)
);
GRANT SELECT, INSERT, UPDATE ON public.focus_insights TO authenticated;
GRANT ALL ON public.focus_insights TO service_role;
ALTER TABLE public.focus_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own insights select" ON public.focus_insights FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insights insert" ON public.focus_insights FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own insights update" ON public.focus_insights FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);