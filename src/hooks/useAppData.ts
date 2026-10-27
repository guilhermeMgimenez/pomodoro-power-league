import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_SETTINGS, PomodoroSettings } from "@/lib/pomodoro";
import { focusPeriodStarts, GoalHorizon, periodFocusMinutes } from "@/lib/goals";

export interface Task {
  id: string;
  title: string;
  scheduled_at: string | null;
  timezone: string;
  estimated_minutes: number;
  completed_minutes: number;
  done: boolean;
  goal_id: string | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error("Entre para continuar.");
      const { data, error } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const useSettings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["settings", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<PomodoroSettings> => {
      if (!user) throw new Error("Entre para continuar.");
      const { data, error } = await supabase
        .from("pomodoro_settings")
        .select("focus_minutes, short_break_minutes, long_break_minutes")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? DEFAULT_SETTINGS;
    },
  });
};

export const useSaveSettings = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: PomodoroSettings) => {
      if (!user) throw new Error("Entre para continuar.");
      const { error } = await supabase
        .from("pomodoro_settings")
        .upsert({ user_id: user.id, ...s, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
};

export const useTasks = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tasks", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id,title,scheduled_at,timezone,estimated_minutes,completed_minutes,done,goal_id")
        .order("done")
        .order("scheduled_at", { nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: Partial<Task> & { title: string }) => {
      const { id, ...rest } = t;
      const { error } = id
        ? await supabase.from("tasks").update(rest).eq("id", id)
        : await supabase.from("tasks").insert(rest);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
};

export const useTodayFocusMinutes = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sessions-today", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from("focus_sessions")
        .select("minutes")
        .eq("mode", "focus")
        .gte("completed_at", start.toISOString());
      if (error) throw error;
      return data.reduce((a, r) => a + r.minutes, 0);
    },
  });
};

export const useRecordSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { taskId: string | null; minutes: number; mode: string }) => {
      const { error } = await supabase.rpc("record_focus_session", {
        _task_id: p.taskId as string,
        _minutes: p.minutes,
        _mode: p.mode,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["sessions-today"] });
      qc.invalidateQueries({ queryKey: ["period-focus"] });
    },
  });
};

export interface Goal {
  id: string;
  title: string;
  horizon: GoalHorizon;
  target_minutes: number;
  due_date: string | null;
}

export interface FocusPreferences {
  daily_minutes: number;
  weekly_minutes: number;
  sound_enabled: boolean;
  notifications_enabled: boolean;
}

export const DEFAULT_FOCUS_PREFERENCES: FocusPreferences = {
  daily_minutes: 100, weekly_minutes: 500, sound_enabled: false, notifications_enabled: false,
};

export const useGoals = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["goals", user?.id], enabled: !!user,
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase.from("goals").select("id,title,horizon,target_minutes,due_date").order("created_at");
      if (error) throw error;
      return data.map((g) => ({ ...g, horizon: g.horizon as GoalHorizon }));
    },
  });
};

export const useUpsertGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goal: Omit<Goal, "id"> & { id?: string }) => {
      const { id, ...rest } = goal;
      const { error } = id ? await supabase.from("goals").update(rest).eq("id", id) : await supabase.from("goals").insert(rest);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
};

export const useDeleteGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useFocusPreferences = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["focus-preferences", user?.id], enabled: !!user,
    queryFn: async (): Promise<FocusPreferences> => {
      if (!user) throw new Error("Entre para continuar.");
      const { data, error } = await supabase.from("focus_preferences").select("daily_minutes,weekly_minutes,sound_enabled,notifications_enabled").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data ?? DEFAULT_FOCUS_PREFERENCES;
    },
  });
};

export const useSaveFocusPreferences = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: FocusPreferences) => {
      if (!user) throw new Error("Entre para continuar.");
      const { error } = await supabase.from("focus_preferences").upsert({ user_id: user.id, ...values });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["focus-preferences"] }),
  });
};

export const usePeriodFocus = () => {
  const { user } = useAuth();
  const { day, week } = focusPeriodStarts();
  return useQuery({
    queryKey: ["period-focus", user?.id, day.toISOString()], enabled: !!user, refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("focus_sessions").select("minutes,mode,completed_at").eq("mode", "focus").gte("completed_at", week.toISOString());
      if (error) throw error;
      return { daily: periodFocusMinutes(data, day), weekly: periodFocusMinutes(data, week) };
    },
  });
};
