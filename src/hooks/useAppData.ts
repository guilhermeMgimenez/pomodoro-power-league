import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_SETTINGS, PomodoroSettings } from "@/lib/pomodoro";
import { focusPeriodStarts, GoalHorizon, periodFocusMinutes } from "@/lib/goals";
import { reportWeek } from "@/lib/reports";

export interface Task {
  id: string;
  title: string;
  scheduled_at: string | null;
  timezone: string;
  estimated_minutes: number;
  completed_minutes: number;
  done: boolean;
  completed_at: string | null;
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
        .select("id,title,scheduled_at,timezone,estimated_minutes,completed_minutes,done,goal_id,completed_at")
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); qc.invalidateQueries({ queryKey: ["weekly-report"] }); },
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
      qc.invalidateQueries({ queryKey: ["weekly-report"] });
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

export interface FocusAdvice { summary: string; tips: { title: string; detail: string }[] }
export interface InsightResult { advice: FocusAdvice; generated_at: string }

export const useWeeklySessions = (offset: number) => {
  const { user } = useAuth();
  const { start, end, previous } = reportWeek(offset);
  return useQuery({
    queryKey: ["weekly-report", user?.id, start.toISOString()], enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error("Entre para continuar.");
      const all = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase.from("focus_sessions").select("id,minutes,mode,completed_at")
          .eq("user_id", user.id).eq("mode", "focus").gte("completed_at", previous.toISOString()).lt("completed_at", end.toISOString())
          .order("completed_at").order("id").range(from, from + 999);
        if (error) throw error;
        all.push(...data);
        if (data.length < 1000) break;
      }
      return all;
    },
  });
};

async function requestInsights(offset: number, refresh: boolean): Promise<InsightResult> {
  const { start, end, previous } = reportWeek(offset);
  const { data, error } = await supabase.functions.invoke("focus-insights", { body: {
    start: start.toISOString(), end: end.toISOString(), previous: previous.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, refresh,
  } });
  if (error) {
    const context = (error as { context?: Response | { error?: string; body?: { error?: string } } }).context;
    const detail = context && "json" in context && typeof context.json === "function"
      ? await context.json().catch(() => null)
      : context && "body" in context ? context.body : context;
    throw new Error(detail?.error ?? "Não foi possível gerar suas sugestões.");
  }
  if (!data?.advice?.tips?.length) throw new Error(data?.error ?? "A IA não retornou sugestões.");
  return data;
}

export const useFocusInsights = (offset: number, enabled: boolean) => {
  const { user } = useAuth();
  const { start } = reportWeek(offset);
  const queryClient = useQueryClient();
  const queryKey = ["focus-insights", user?.id, start.toISOString()];
  const query = useQuery({ queryKey, enabled: !!user && enabled, queryFn: () => requestInsights(offset, false),
    retry: false, staleTime: Infinity, refetchOnWindowFocus: false, refetchOnMount: false });
  const refresh = useMutation({ mutationFn: () => requestInsights(offset, true),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data) });
  useEffect(() => { refresh.reset(); }, [offset]);
  return { ...query, refresh };
};
