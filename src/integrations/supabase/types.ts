export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      focus_insights: {
        Row: {
          advice: Json | null
          error_message: string | null
          error_status: number | null
          generated_at: string
          timezone: string
          user_id: string
          week_start: string
        }
        Insert: {
          advice?: Json | null
          error_message?: string | null
          error_status?: number | null
          generated_at?: string
          timezone: string
          user_id?: string
          week_start: string
        }
        Update: {
          advice?: Json | null
          error_message?: string | null
          error_status?: number | null
          generated_at?: string
          timezone?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      focus_preferences: {
        Row: {
          daily_minutes: number
          notifications_enabled: boolean
          sound_enabled: boolean
          user_id: string
          weekly_minutes: number
        }
        Insert: {
          daily_minutes?: number
          notifications_enabled?: boolean
          sound_enabled?: boolean
          user_id?: string
          weekly_minutes?: number
        }
        Update: {
          daily_minutes?: number
          notifications_enabled?: boolean
          sound_enabled?: boolean
          user_id?: string
          weekly_minutes?: number
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          completed_at: string
          id: string
          minutes: number
          mode: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          minutes: number
          mode?: string
          task_id?: string | null
          user_id?: string
        }
        Update: {
          completed_at?: string
          id?: string
          minutes?: number
          mode?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          due_date: string | null
          horizon: string
          id: string
          target_minutes: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          horizon?: string
          id?: string
          target_minutes?: number
          title: string
          user_id?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          horizon?: string
          id?: string
          target_minutes?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      pomodoro_settings: {
        Row: {
          focus_minutes: number
          long_break_minutes: number
          short_break_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          focus_minutes?: number
          long_break_minutes?: number
          short_break_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          focus_minutes?: number
          long_break_minutes?: number
          short_break_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          completed_minutes: number
          created_at: string
          done: boolean
          estimated_minutes: number
          goal_id: string | null
          id: string
          scheduled_at: string | null
          timezone: string
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_minutes?: number
          created_at?: string
          done?: boolean
          estimated_minutes?: number
          goal_id?: string | null
          id?: string
          scheduled_at?: string | null
          timezone?: string
          title: string
          user_id?: string
        }
        Update: {
          completed_at?: string | null
          completed_minutes?: number
          created_at?: string
          done?: boolean
          estimated_minutes?: number
          goal_id?: string | null
          id?: string
          scheduled_at?: string | null
          timezone?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_focus_session: {
        Args: { _minutes: number; _mode: string; _task_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
