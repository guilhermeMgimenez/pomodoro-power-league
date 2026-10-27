import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_SETTINGS, PomodoroSettings } from "@/lib/pomodoro";

export interface Task {
  id: string;
  title: string;
  scheduled_at: string | null;
  timezone: string;
  estimated_minutes: number;
  completed_minutes: number;
  done: boolean;
}

export const useProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("display_name").eq("id", user!.id).maybeSingle();
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
      const { data, error } = await supabase
        .from("pomodoro_settings")
        .select("focus_minutes, short_break_minutes, long_break_minutes")
        .eq("user_id", user!.id)
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
      const { error } = await supabase
        .from("pomodoro_settings")
        .upsert({ user_id: user!.id, ...s, updated_at: new Date().toISOString() });
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
        .select("id,title,scheduled_at,timezone,estimated_minutes,completed_minutes,done")
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
    },
  });
};
