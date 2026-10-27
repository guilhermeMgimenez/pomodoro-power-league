CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.pomodoro_settings (
  user_id uuid PRIMARY KEY,
  focus_minutes int NOT NULL DEFAULT 25 CHECK (focus_minutes > 0),
  short_break_minutes int NOT NULL DEFAULT 5 CHECK (short_break_minutes > 0),
  long_break_minutes int NOT NULL DEFAULT 15 CHECK (long_break_minutes > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.pomodoro_settings TO authenticated;
GRANT ALL ON public.pomodoro_settings TO service_role;
ALTER TABLE public.pomodoro_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings" ON public.pomodoro_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  scheduled_at timestamptz,
  timezone text NOT NULL DEFAULT 'UTC',
  estimated_minutes int NOT NULL DEFAULT 25 CHECK (estimated_minutes > 0),
  completed_minutes int NOT NULL DEFAULT 0 CHECK (completed_minutes >= 0),
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tasks" ON public.tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX tasks_user_idx ON public.tasks(user_id, scheduled_at);

CREATE TABLE public.focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  mode text NOT NULL DEFAULT 'focus',
  minutes int NOT NULL CHECK (minutes > 0),
  completed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.focus_sessions TO authenticated;
GRANT ALL ON public.focus_sessions TO service_role;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions select" ON public.focus_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sessions insert" ON public.focus_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX focus_sessions_user_idx ON public.focus_sessions(user_id, completed_at);

CREATE OR REPLACE FUNCTION public.record_focus_session(_task_id uuid, _minutes int, _mode text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  INSERT INTO public.focus_sessions (user_id, task_id, mode, minutes) VALUES (auth.uid(), _task_id, _mode, _minutes);
  IF _task_id IS NOT NULL AND _mode = 'focus' THEN
    UPDATE public.tasks SET completed_minutes = completed_minutes + _minutes WHERE id = _task_id AND user_id = auth.uid();
  END IF;
END; $$;
GRANT EXECUTE ON FUNCTION public.record_focus_session(uuid, int, text) TO authenticated;