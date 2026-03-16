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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      changes: {
        Row: {
          agent_version: string | null
          chain_hash: string | null
          content_after: string | null
          content_before: string | null
          created_at: string
          detected_at: string
          diff: string | null
          hash: string
          id: string
          jurisdiction: string
          raw_classification: Json | null
          relevance_score: number | null
          review_status: string
          severity: string | null
          source_id: string
          source_url_id: string | null
          summary: string | null
          superseded_by: string | null
        }
        Insert: {
          agent_version?: string | null
          chain_hash?: string | null
          content_after?: string | null
          content_before?: string | null
          created_at?: string
          detected_at?: string
          diff?: string | null
          hash: string
          id?: string
          jurisdiction?: string
          raw_classification?: Json | null
          relevance_score?: number | null
          review_status?: string
          severity?: string | null
          source_id: string
          source_url_id?: string | null
          summary?: string | null
          superseded_by?: string | null
        }
        Update: {
          agent_version?: string | null
          chain_hash?: string | null
          content_after?: string | null
          content_before?: string | null
          created_at?: string
          detected_at?: string
          diff?: string | null
          hash?: string
          id?: string
          jurisdiction?: string
          raw_classification?: Json | null
          relevance_score?: number | null
          review_status?: string
          severity?: string | null
          source_id?: string
          source_url_id?: string | null
          summary?: string | null
          superseded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "changes_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "changes_source_url_id_fkey"
            columns: ["source_url_id"]
            isOneToOne: false
            referencedRelation: "source_urls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "changes_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "changes"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_events: {
        Row: {
          context: Json | null
          cost_usd: number
          created_at: string
          id: string
          operation: string
          service: string
          tokens_in: number | null
          tokens_out: number | null
        }
        Insert: {
          context?: Json | null
          cost_usd: number
          created_at?: string
          id?: string
          operation: string
          service: string
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Update: {
          context?: Json | null
          cost_usd?: number
          created_at?: string
          id?: string
          operation?: string
          service?: string
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          enabled: boolean
          flag_name: string
          id: string
          tier: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          flag_name: string
          id?: string
          tier: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          flag_name?: string
          id?: string
          tier?: string
        }
        Relationships: []
      }
      practice_acknowledgments: {
        Row: {
          acknowledged_at: string
          acknowledged_by: string
          change_id: string
          id: string
          practice_id: string
        }
        Insert: {
          acknowledged_at?: string
          acknowledged_by: string
          change_id: string
          id?: string
          practice_id: string
        }
        Update: {
          acknowledged_at?: string
          acknowledged_by?: string
          change_id?: string
          id?: string
          practice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_acknowledgments_change_id_fkey"
            columns: ["change_id"]
            isOneToOne: false
            referencedRelation: "changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_acknowledgments_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practices: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_email: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_email: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_email?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          agent_name: string
          created_at: string
          id: string
          is_active: boolean
          prompt: string
          version: string
        }
        Insert: {
          agent_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          prompt: string
          version: string
        }
        Update: {
          agent_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          prompt?: string
          version?: string
        }
        Relationships: []
      }
      review_actions: {
        Row: {
          action: string
          change_id: string
          created_at: string
          id: string
          notes: string | null
          reviewer_id: string
        }
        Insert: {
          action: string
          change_id: string
          created_at?: string
          id?: string
          notes?: string | null
          reviewer_id: string
        }
        Update: {
          action?: string
          change_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_actions_change_id_fkey"
            columns: ["change_id"]
            isOneToOne: false
            referencedRelation: "changes"
            referencedColumns: ["id"]
          },
        ]
      }
      review_rules: {
        Row: {
          auto_approve: boolean
          id: string
          notes: string | null
          route_to_hitl: boolean
          severity: string
        }
        Insert: {
          auto_approve?: boolean
          id?: string
          notes?: string | null
          route_to_hitl?: boolean
          severity: string
        }
        Update: {
          auto_approve?: boolean
          id?: string
          notes?: string | null
          route_to_hitl?: boolean
          severity?: string
        }
        Relationships: []
      }
      source_urls: {
        Row: {
          created_at: string
          id: string
          last_fetch_method: string | null
          last_fetched_at: string | null
          last_hash: string | null
          source_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_fetch_method?: string | null
          last_fetched_at?: string | null
          last_hash?: string | null
          source_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          last_fetch_method?: string | null
          last_fetched_at?: string | null
          last_hash?: string | null
          source_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_urls_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string
          fetch_method: string
          id: string
          is_active: boolean
          jurisdiction: string
          name: string
          scrape_config: Json | null
          tier: string
          url: string
        }
        Insert: {
          created_at?: string
          fetch_method: string
          id?: string
          is_active?: boolean
          jurisdiction?: string
          name: string
          scrape_config?: Json | null
          tier: string
          url: string
        }
        Update: {
          created_at?: string
          fetch_method?: string
          id?: string
          is_active?: boolean
          jurisdiction?: string
          name?: string
          scrape_config?: Json | null
          tier?: string
          url?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
