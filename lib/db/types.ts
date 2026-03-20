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
          chain_sequence: number | null
          content_after: string | null
          content_before: string | null
          created_at: string
          detected_at: string
          diff: string | null
          hash: string
          id: string
          jurisdiction: string
          normalized_diff: Json | null
          prev_chain_hash: string | null
          raw_classification: Json | null
          relevance_score: number | null
          review_action: string | null
          review_notes: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string | null
          source_id: string
          source_url_id: string | null
          summary: string | null
          superseded_by: string | null
        }
        Insert: {
          agent_version?: string | null
          chain_hash?: string | null
          chain_sequence?: number | null
          content_after?: string | null
          content_before?: string | null
          created_at?: string
          detected_at?: string
          diff?: string | null
          hash: string
          id?: string
          jurisdiction?: string
          normalized_diff?: Json | null
          prev_chain_hash?: string | null
          raw_classification?: Json | null
          relevance_score?: number | null
          review_action?: string | null
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          source_id: string
          source_url_id?: string | null
          summary?: string | null
          superseded_by?: string | null
        }
        Update: {
          agent_version?: string | null
          chain_hash?: string | null
          chain_sequence?: number | null
          content_after?: string | null
          content_before?: string | null
          created_at?: string
          detected_at?: string
          diff?: string | null
          hash?: string
          id?: string
          jurisdiction?: string
          normalized_diff?: Json | null
          prev_chain_hash?: string | null
          raw_classification?: Json | null
          relevance_score?: number | null
          review_action?: string | null
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
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
      classification_overrides: {
        Row: {
          change_id: string | null
          created_at: string
          entity_id: string | null
          field_changed: string
          id: string
          new_result_id: string | null
          new_value: Json
          old_value: Json
          overridden_by: string
          previous_result_id: string | null
          reason: string
        }
        Insert: {
          change_id?: string | null
          created_at?: string
          entity_id?: string | null
          field_changed: string
          id?: string
          new_result_id?: string | null
          new_value: Json
          old_value: Json
          overridden_by: string
          previous_result_id?: string | null
          reason: string
        }
        Update: {
          change_id?: string | null
          created_at?: string
          entity_id?: string | null
          field_changed?: string
          id?: string
          new_result_id?: string | null
          new_value?: Json
          old_value?: Json
          overridden_by?: string
          previous_result_id?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "classification_overrides_change_id_fkey"
            columns: ["change_id"]
            isOneToOne: false
            referencedRelation: "changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_overrides_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_overrides_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_overrides_new_result_id_fkey"
            columns: ["new_result_id"]
            isOneToOne: false
            referencedRelation: "classification_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_overrides_new_result_id_fkey"
            columns: ["new_result_id"]
            isOneToOne: false
            referencedRelation: "v_classification_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_overrides_previous_result_id_fkey"
            columns: ["previous_result_id"]
            isOneToOne: false
            referencedRelation: "classification_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_overrides_previous_result_id_fkey"
            columns: ["previous_result_id"]
            isOneToOne: false
            referencedRelation: "v_classification_history"
            referencedColumns: ["id"]
          },
        ]
      }
      classification_results: {
        Row: {
          agent_name: string | null
          agent_version: string | null
          change_id: string | null
          classification_method: string
          confidence: number | null
          created_at: string
          created_by: string
          domain_slugs: string[] | null
          entity_id: string | null
          entity_type_slug: string | null
          id: string
          is_current: boolean
          model: string | null
          raw_output: Json | null
          reasoning: string | null
          rule_id: string | null
          severity: string | null
          superseded_by: string | null
        }
        Insert: {
          agent_name?: string | null
          agent_version?: string | null
          change_id?: string | null
          classification_method: string
          confidence?: number | null
          created_at?: string
          created_by?: string
          domain_slugs?: string[] | null
          entity_id?: string | null
          entity_type_slug?: string | null
          id?: string
          is_current?: boolean
          model?: string | null
          raw_output?: Json | null
          reasoning?: string | null
          rule_id?: string | null
          severity?: string | null
          superseded_by?: string | null
        }
        Update: {
          agent_name?: string | null
          agent_version?: string | null
          change_id?: string | null
          classification_method?: string
          confidence?: number | null
          created_at?: string
          created_by?: string
          domain_slugs?: string[] | null
          entity_id?: string | null
          entity_type_slug?: string | null
          id?: string
          is_current?: boolean
          model?: string | null
          raw_output?: Json | null
          reasoning?: string | null
          rule_id?: string | null
          severity?: string | null
          superseded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classification_results_change_id_fkey"
            columns: ["change_id"]
            isOneToOne: false
            referencedRelation: "changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_results_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_results_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_results_entity_type_slug_fkey"
            columns: ["entity_type_slug"]
            isOneToOne: false
            referencedRelation: "kg_entity_types"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "classification_results_entity_type_slug_fkey"
            columns: ["entity_type_slug"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["entity_type_slug"]
          },
          {
            foreignKeyName: "classification_results_entity_type_slug_fkey"
            columns: ["entity_type_slug"]
            isOneToOne: false
            referencedRelation: "v_entity_types_flat"
            referencedColumns: ["parent_slug"]
          },
          {
            foreignKeyName: "classification_results_entity_type_slug_fkey"
            columns: ["entity_type_slug"]
            isOneToOne: false
            referencedRelation: "v_entity_types_flat"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "classification_results_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "classification_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_results_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "v_active_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_results_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "classification_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_results_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "v_classification_history"
            referencedColumns: ["id"]
          },
        ]
      }
      classification_rule_sets: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      classification_rules: {
        Row: {
          action: Json
          conditions: Json
          confidence_threshold: number
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          last_matched_at: string | null
          name: string
          priority: number
          rule_set_id: string | null
          rule_type: string
          stage: number
          stop_on_match: boolean
          times_matched: number
          updated_at: string
          version: number
        }
        Insert: {
          action?: Json
          conditions?: Json
          confidence_threshold?: number
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_matched_at?: string | null
          name: string
          priority?: number
          rule_set_id?: string | null
          rule_type?: string
          stage?: number
          stop_on_match?: boolean
          times_matched?: number
          updated_at?: string
          version?: number
        }
        Update: {
          action?: Json
          conditions?: Json
          confidence_threshold?: number
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_matched_at?: string | null
          name?: string
          priority?: number
          rule_set_id?: string | null
          rule_type?: string
          stage?: number
          stop_on_match?: boolean
          times_matched?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_rule_set"
            columns: ["rule_set_id"]
            isOneToOne: false
            referencedRelation: "classification_rule_sets"
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
      crawl_templates: {
        Row: {
          changelog: Json | null
          created_at: string
          created_by: string
          default_config: Json
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          source_count: number
          updated_at: string
          version: number
        }
        Insert: {
          changelog?: Json | null
          created_at?: string
          created_by?: string
          default_config?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          source_count?: number
          updated_at?: string
          version?: number
        }
        Update: {
          changelog?: Json | null
          created_at?: string
          created_by?: string
          default_config?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          source_count?: number
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      discovery_runs: {
        Row: {
          agent_cost_usd: number | null
          completed_at: string | null
          created_at: string
          entities_created: number | null
          errors: Json | null
          fetch_cost_usd: number | null
          id: string
          items_changed: number | null
          items_classified: number | null
          items_extracted: number | null
          items_new: number | null
          items_queued: number | null
          items_scanned: number | null
          nav_changed: boolean | null
          patterns_discovered: Json | null
          run_type: string
          source_url_id: string
          started_at: string
          status: string
        }
        Insert: {
          agent_cost_usd?: number | null
          completed_at?: string | null
          created_at?: string
          entities_created?: number | null
          errors?: Json | null
          fetch_cost_usd?: number | null
          id?: string
          items_changed?: number | null
          items_classified?: number | null
          items_extracted?: number | null
          items_new?: number | null
          items_queued?: number | null
          items_scanned?: number | null
          nav_changed?: boolean | null
          patterns_discovered?: Json | null
          run_type: string
          source_url_id: string
          started_at?: string
          status?: string
        }
        Update: {
          agent_cost_usd?: number | null
          completed_at?: string | null
          created_at?: string
          entities_created?: number | null
          errors?: Json | null
          fetch_cost_usd?: number | null
          id?: string
          items_changed?: number | null
          items_classified?: number | null
          items_extracted?: number | null
          items_new?: number | null
          items_queued?: number | null
          items_scanned?: number | null
          nav_changed?: boolean | null
          patterns_discovered?: Json | null
          run_type?: string
          source_url_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovery_runs_source_url_id_fkey"
            columns: ["source_url_id"]
            isOneToOne: false
            referencedRelation: "source_urls"
            referencedColumns: ["id"]
          },
        ]
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
      kg_classification_log: {
        Row: {
          classified_at: string
          classified_by: string | null
          confidence: number | null
          domain_id: string | null
          entity_id: string
          id: string
          needs_review: boolean
          review_reason: string | null
          rule_id: string | null
          run_id: string | null
          stage: string
        }
        Insert: {
          classified_at?: string
          classified_by?: string | null
          confidence?: number | null
          domain_id?: string | null
          entity_id: string
          id?: string
          needs_review?: boolean
          review_reason?: string | null
          rule_id?: string | null
          run_id?: string | null
          stage: string
        }
        Update: {
          classified_at?: string
          classified_by?: string | null
          confidence?: number | null
          domain_id?: string | null
          entity_id?: string
          id?: string
          needs_review?: boolean
          review_reason?: string | null
          rule_id?: string | null
          run_id?: string | null
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "kg_classification_log_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "kg_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_classification_log_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_classification_log_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_classification_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "classification_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_classification_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "v_active_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_domain_practice_type_map: {
        Row: {
          applies_to_all_types: boolean
          created_at: string
          domain_slug: string
          id: string
          practice_type_slug: string
          relevance_weight: number
        }
        Insert: {
          applies_to_all_types?: boolean
          created_at?: string
          domain_slug: string
          id?: string
          practice_type_slug: string
          relevance_weight?: number
        }
        Update: {
          applies_to_all_types?: boolean
          created_at?: string
          domain_slug?: string
          id?: string
          practice_type_slug?: string
          relevance_weight?: number
        }
        Relationships: []
      }
      kg_domains: {
        Row: {
          color: string | null
          created_at: string
          depth: number
          description: string | null
          domain_code: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          taxonomy_source: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          depth?: number
          description?: string | null
          domain_code?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          taxonomy_source?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          depth?: number
          description?: string | null
          domain_code?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          taxonomy_source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kg_domains_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "kg_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_entities: {
        Row: {
          agencies: Json | null
          authority_level:
            | Database["public"]["Enums"]["authority_level_enum"]
            | null
          cfr_references: Json | null
          change_id: string | null
          citation: string | null
          classification_confidence: number | null
          comment_close_date: string | null
          created_at: string
          current_classification_id: string | null
          description: string | null
          document_type: string | null
          effective_date: string | null
          entity_type: string
          entity_type_id: string | null
          external_url: string | null
          id: string
          identifier: string | null
          issuing_agency: string | null
          jurisdiction: string
          last_classified_at: string | null
          metadata: Json | null
          name: string
          pdf_url: string | null
          publication_date: string | null
          search_vector: unknown
          source_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          agencies?: Json | null
          authority_level?:
            | Database["public"]["Enums"]["authority_level_enum"]
            | null
          cfr_references?: Json | null
          change_id?: string | null
          citation?: string | null
          classification_confidence?: number | null
          comment_close_date?: string | null
          created_at?: string
          current_classification_id?: string | null
          description?: string | null
          document_type?: string | null
          effective_date?: string | null
          entity_type: string
          entity_type_id?: string | null
          external_url?: string | null
          id?: string
          identifier?: string | null
          issuing_agency?: string | null
          jurisdiction?: string
          last_classified_at?: string | null
          metadata?: Json | null
          name: string
          pdf_url?: string | null
          publication_date?: string | null
          search_vector?: unknown
          source_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          agencies?: Json | null
          authority_level?:
            | Database["public"]["Enums"]["authority_level_enum"]
            | null
          cfr_references?: Json | null
          change_id?: string | null
          citation?: string | null
          classification_confidence?: number | null
          comment_close_date?: string | null
          created_at?: string
          current_classification_id?: string | null
          description?: string | null
          document_type?: string | null
          effective_date?: string | null
          entity_type?: string
          entity_type_id?: string | null
          external_url?: string | null
          id?: string
          identifier?: string | null
          issuing_agency?: string | null
          jurisdiction?: string
          last_classified_at?: string | null
          metadata?: Json | null
          name?: string
          pdf_url?: string | null
          publication_date?: string | null
          search_vector?: unknown
          source_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kg_entities_change_id_fkey"
            columns: ["change_id"]
            isOneToOne: false
            referencedRelation: "changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entities_current_classification_id_fkey"
            columns: ["current_classification_id"]
            isOneToOne: false
            referencedRelation: "classification_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entities_current_classification_id_fkey"
            columns: ["current_classification_id"]
            isOneToOne: false
            referencedRelation: "v_classification_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entities_entity_type_id_fkey"
            columns: ["entity_type_id"]
            isOneToOne: false
            referencedRelation: "kg_entity_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entities_entity_type_id_fkey"
            columns: ["entity_type_id"]
            isOneToOne: false
            referencedRelation: "v_entity_types_flat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_entity_domains: {
        Row: {
          assigned_by: string
          classified_at: string | null
          classified_by: string | null
          confidence: number | null
          created_at: string
          domain_id: string
          entity_id: string
          is_primary: boolean
          relevance_score: number | null
        }
        Insert: {
          assigned_by?: string
          classified_at?: string | null
          classified_by?: string | null
          confidence?: number | null
          created_at?: string
          domain_id: string
          entity_id: string
          is_primary?: boolean
          relevance_score?: number | null
        }
        Update: {
          assigned_by?: string
          classified_at?: string | null
          classified_by?: string | null
          confidence?: number | null
          created_at?: string
          domain_id?: string
          entity_id?: string
          is_primary?: boolean
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kg_entity_domains_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "kg_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_domains_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_domains_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_entity_jurisdictions: {
        Row: {
          created_at: string
          entity_id: string
          is_primary: boolean
          jurisdiction_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          is_primary?: boolean
          jurisdiction_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          is_primary?: boolean
          jurisdiction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kg_entity_jurisdictions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_jurisdictions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_jurisdictions_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "kg_jurisdictions"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_entity_merges: {
        Row: {
          created_at: string
          id: string
          merge_reason: string
          merge_strategy: string
          merged_by: string
          merged_entity_id: string
          merged_entity_snapshot: Json
          surviving_entity_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          merge_reason: string
          merge_strategy?: string
          merged_by: string
          merged_entity_id: string
          merged_entity_snapshot: Json
          surviving_entity_id: string
        }
        Update: {
          created_at?: string
          id?: string
          merge_reason?: string
          merge_strategy?: string
          merged_by?: string
          merged_entity_id?: string
          merged_entity_snapshot?: Json
          surviving_entity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kg_entity_merges_merged_entity_id_fkey"
            columns: ["merged_entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_merges_merged_entity_id_fkey"
            columns: ["merged_entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_merges_surviving_entity_id_fkey"
            columns: ["surviving_entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_merges_surviving_entity_id_fkey"
            columns: ["surviving_entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_entity_practice_relevance: {
        Row: {
          classified_at: string
          classified_by: string
          entity_id: string
          practice_type_id: string
          relevance_score: number | null
        }
        Insert: {
          classified_at?: string
          classified_by?: string
          entity_id: string
          practice_type_id: string
          relevance_score?: number | null
        }
        Update: {
          classified_at?: string
          classified_by?: string
          entity_id?: string
          practice_type_id?: string
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kg_entity_practice_relevance_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_practice_relevance_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_practice_relevance_practice_type_id_fkey"
            columns: ["practice_type_id"]
            isOneToOne: false
            referencedRelation: "kg_practice_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_practice_relevance_practice_type_id_fkey"
            columns: ["practice_type_id"]
            isOneToOne: false
            referencedRelation: "mv_practice_relevance_summary"
            referencedColumns: ["practice_type_id"]
          },
        ]
      }
      kg_entity_types: {
        Row: {
          created_at: string
          created_by: string | null
          depth: number
          description: string | null
          distinguishing_criteria: string | null
          example_documents: string[] | null
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          parent_id: string | null
          path: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          depth?: number
          description?: string | null
          distinguishing_criteria?: string | null
          example_documents?: string[] | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
          parent_id?: string | null
          path?: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          depth?: number
          description?: string | null
          distinguishing_criteria?: string | null
          example_documents?: string[] | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
          parent_id?: string | null
          path?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kg_entity_types_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "kg_entity_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_types_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_entity_types_flat"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_entity_versions: {
        Row: {
          change_id: string | null
          change_summary: string | null
          content_hash: string | null
          content_snapshot: string | null
          created_at: string
          entity_id: string
          fr_document_number: string | null
          id: string
          snapshot: Json
          version_date: string | null
          version_number: number
        }
        Insert: {
          change_id?: string | null
          change_summary?: string | null
          content_hash?: string | null
          content_snapshot?: string | null
          created_at?: string
          entity_id: string
          fr_document_number?: string | null
          id?: string
          snapshot: Json
          version_date?: string | null
          version_number: number
        }
        Update: {
          change_id?: string | null
          change_summary?: string | null
          content_hash?: string | null
          content_snapshot?: string | null
          created_at?: string
          entity_id?: string
          fr_document_number?: string | null
          id?: string
          snapshot?: Json
          version_date?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "kg_entity_versions_change_id_fkey"
            columns: ["change_id"]
            isOneToOne: false
            referencedRelation: "changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_versions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_entity_versions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_jurisdictions: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          jurisdiction_type: string
          name: string
          parent_code: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          jurisdiction_type: string
          name: string
          parent_code?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          jurisdiction_type?: string
          name?: string
          parent_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kg_jurisdictions_parent_code_fkey"
            columns: ["parent_code"]
            isOneToOne: false
            referencedRelation: "kg_jurisdictions"
            referencedColumns: ["code"]
          },
        ]
      }
      kg_practice_types: {
        Row: {
          classification: string
          created_at: string
          display_name: string
          grouping: string
          id: string
          is_active: boolean
          is_cedar_target: boolean
          nucc_code: string | null
          slug: string
          sort_order: number
          specialization: string | null
        }
        Insert: {
          classification: string
          created_at?: string
          display_name: string
          grouping: string
          id?: string
          is_active?: boolean
          is_cedar_target?: boolean
          nucc_code?: string | null
          slug: string
          sort_order?: number
          specialization?: string | null
        }
        Update: {
          classification?: string
          created_at?: string
          display_name?: string
          grouping?: string
          id?: string
          is_active?: boolean
          is_cedar_target?: boolean
          nucc_code?: string | null
          slug?: string
          sort_order?: number
          specialization?: string | null
        }
        Relationships: []
      }
      kg_relationship_types: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          forward_label: string
          id: string
          inverse_label: string
          is_active: boolean
          is_exclusive: boolean
          is_system: boolean
          is_temporal: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
          valid_from_types: string[] | null
          valid_to_types: string[] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          forward_label: string
          id?: string
          inverse_label: string
          is_active?: boolean
          is_exclusive?: boolean
          is_system?: boolean
          is_temporal?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          valid_from_types?: string[] | null
          valid_to_types?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          forward_label?: string
          id?: string
          inverse_label?: string
          is_active?: boolean
          is_exclusive?: boolean
          is_system?: boolean
          is_temporal?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          valid_from_types?: string[] | null
          valid_to_types?: string[] | null
        }
        Relationships: []
      }
      kg_relationships: {
        Row: {
          confidence: number | null
          created_at: string
          effective_date: string | null
          end_date: string | null
          fr_citation: string | null
          id: string
          notes: string | null
          provenance: string | null
          rel_type: Database["public"]["Enums"]["relationship_type_enum"] | null
          relationship_type: string
          relationship_type_id: string | null
          source_change_id: string | null
          source_entity_id: string
          target_entity_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          effective_date?: string | null
          end_date?: string | null
          fr_citation?: string | null
          id?: string
          notes?: string | null
          provenance?: string | null
          rel_type?:
            | Database["public"]["Enums"]["relationship_type_enum"]
            | null
          relationship_type: string
          relationship_type_id?: string | null
          source_change_id?: string | null
          source_entity_id: string
          target_entity_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          effective_date?: string | null
          end_date?: string | null
          fr_citation?: string | null
          id?: string
          notes?: string | null
          provenance?: string | null
          rel_type?:
            | Database["public"]["Enums"]["relationship_type_enum"]
            | null
          relationship_type?: string
          relationship_type_id?: string | null
          source_change_id?: string | null
          source_entity_id?: string
          target_entity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kg_relationships_relationship_type_id_fkey"
            columns: ["relationship_type_id"]
            isOneToOne: false
            referencedRelation: "kg_relationship_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_source_change_id_fkey"
            columns: ["source_change_id"]
            isOneToOne: false
            referencedRelation: "changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_source_entity_id_fkey"
            columns: ["source_entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_source_entity_id_fkey"
            columns: ["source_entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_target_entity_id_fkey"
            columns: ["target_entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_target_entity_id_fkey"
            columns: ["target_entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_service_line_regulations: {
        Row: {
          classified_at: string
          classified_by: string
          entity_id: string
          regulation_role: string
          relevance_score: number
          service_line_id: string
        }
        Insert: {
          classified_at?: string
          classified_by?: string
          entity_id: string
          regulation_role?: string
          relevance_score?: number
          service_line_id: string
        }
        Update: {
          classified_at?: string
          classified_by?: string
          entity_id?: string
          regulation_role?: string
          relevance_score?: number
          service_line_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kg_service_line_regulations_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_service_line_regulations_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_service_line_regulations_service_line_id_fkey"
            columns: ["service_line_id"]
            isOneToOne: false
            referencedRelation: "kg_service_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_service_lines: {
        Row: {
          cpt_codes: string[] | null
          created_at: string
          description: string | null
          icd10_codes: string[] | null
          id: string
          is_active: boolean
          is_cedar_target: boolean
          name: string
          practice_type_id: string | null
          regulation_domains: string[] | null
          slug: string
          sort_order: number
        }
        Insert: {
          cpt_codes?: string[] | null
          created_at?: string
          description?: string | null
          icd10_codes?: string[] | null
          id?: string
          is_active?: boolean
          is_cedar_target?: boolean
          name: string
          practice_type_id?: string | null
          regulation_domains?: string[] | null
          slug: string
          sort_order?: number
        }
        Update: {
          cpt_codes?: string[] | null
          created_at?: string
          description?: string | null
          icd10_codes?: string[] | null
          id?: string
          is_active?: boolean
          is_cedar_target?: boolean
          name?: string
          practice_type_id?: string | null
          regulation_domains?: string[] | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "kg_service_lines_practice_type_id_fkey"
            columns: ["practice_type_id"]
            isOneToOne: false
            referencedRelation: "kg_practice_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_service_lines_practice_type_id_fkey"
            columns: ["practice_type_id"]
            isOneToOne: false
            referencedRelation: "mv_practice_relevance_summary"
            referencedColumns: ["practice_type_id"]
          },
        ]
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
      practice_equipment: {
        Row: {
          created_at: string
          equipment_type: string
          id: string
          practice_id: string
          vendor: string | null
        }
        Insert: {
          created_at?: string
          equipment_type: string
          id?: string
          practice_id: string
          vendor?: string | null
        }
        Update: {
          created_at?: string
          equipment_type?: string
          id?: string
          practice_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_equipment_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_profiles: {
        Row: {
          accepts_medicaid: boolean
          accepts_medicare: boolean
          annual_revenue_band: string | null
          city: string | null
          compounding_pharmacy: boolean
          created_at: string
          dea_registered: boolean
          id: string
          npi: string | null
          onboarding_complete: boolean
          practice_id: string
          provider_count: number | null
          state: string
          updated_at: string
          uses_telehealth: boolean
          website: string | null
          zip_code: string | null
        }
        Insert: {
          accepts_medicaid?: boolean
          accepts_medicare?: boolean
          annual_revenue_band?: string | null
          city?: string | null
          compounding_pharmacy?: boolean
          created_at?: string
          dea_registered?: boolean
          id?: string
          npi?: string | null
          onboarding_complete?: boolean
          practice_id: string
          provider_count?: number | null
          state?: string
          updated_at?: string
          uses_telehealth?: boolean
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          accepts_medicaid?: boolean
          accepts_medicare?: boolean
          annual_revenue_band?: string | null
          city?: string | null
          compounding_pharmacy?: boolean
          created_at?: string
          dea_registered?: boolean
          id?: string
          npi?: string | null
          onboarding_complete?: boolean
          practice_id?: string
          provider_count?: number | null
          state?: string
          updated_at?: string
          uses_telehealth?: boolean
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_profiles_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: true
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_service_lines: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          practice_id: string
          service_line_id: string
          volume_band: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          practice_id: string
          service_line_id: string
          volume_band?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          practice_id?: string
          service_line_id?: string
          volume_band?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_service_lines_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_service_lines_service_line_id_fkey"
            columns: ["service_line_id"]
            isOneToOne: false
            referencedRelation: "kg_service_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_staff: {
        Row: {
          count: number
          created_at: string
          id: string
          practice_id: string
          role: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          practice_id: string
          role: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          practice_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_staff_practice_id_fkey"
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
          current_period_end: string | null
          deleted_at: string | null
          id: string
          name: string
          notification_preferences: Json
          owner_email: string
          owner_name: string | null
          phone: string | null
          practice_type: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          tier: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          notification_preferences?: Json
          owner_email: string
          owner_name?: string | null
          phone?: string | null
          practice_type?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tier?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          notification_preferences?: Json
          owner_email?: string
          owner_name?: string | null
          phone?: string | null
          practice_type?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
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
          scrape_config: Json | null
          source_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_fetch_method?: string | null
          last_fetched_at?: string | null
          last_hash?: string | null
          scrape_config?: Json | null
          source_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          last_fetch_method?: string | null
          last_fetched_at?: string | null
          last_hash?: string | null
          scrape_config?: Json | null
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
      taxonomy_changelog: {
        Row: {
          action: string
          changed_by: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          reason: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_by: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_by?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      validation_log: {
        Row: {
          chains_broken: number
          chains_valid: number
          created_at: string
          errors: Json
          id: string
          run_at: string
          run_type: string
          sources_checked: number
          summary: string | null
          total_changes: number
        }
        Insert: {
          chains_broken?: number
          chains_valid?: number
          created_at?: string
          errors?: Json
          id?: string
          run_at?: string
          run_type?: string
          sources_checked?: number
          summary?: string | null
          total_changes?: number
        }
        Update: {
          chains_broken?: number
          chains_valid?: number
          created_at?: string
          errors?: Json
          id?: string
          run_at?: string
          run_type?: string
          sources_checked?: number
          summary?: string | null
          total_changes?: number
        }
        Relationships: []
      }
    }
    Views: {
      mv_corpus_facets: {
        Row: {
          agency: string | null
          doc_count: number | null
          domain: string | null
          entity_type: string | null
          jurisdiction: string | null
        }
        Relationships: []
      }
      mv_practice_relevance_summary: {
        Row: {
          avg_relevance_score: number | null
          display_name: string | null
          high_relevance_count: number | null
          is_cedar_target: boolean | null
          medium_relevance_count: number | null
          practice_type_id: string | null
          practice_type_slug: string | null
          total_regulations: number | null
        }
        Relationships: []
      }
      v_active_rules: {
        Row: {
          action: Json | null
          conditions: Json | null
          description: string | null
          id: string | null
          last_matched_at: string | null
          name: string | null
          priority: number | null
          rule_set_name: string | null
          rule_type: string | null
          times_matched: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_classification_history: {
        Row: {
          agent_name: string | null
          agent_version: string | null
          change_id: string | null
          classification_method: string | null
          confidence: number | null
          created_at: string | null
          created_by: string | null
          domain_slugs: string[] | null
          entity_id: string | null
          entity_type_slug: string | null
          id: string | null
          is_current: boolean | null
          reasoning: string | null
          severity: string | null
        }
        Insert: {
          agent_name?: string | null
          agent_version?: string | null
          change_id?: string | null
          classification_method?: string | null
          confidence?: number | null
          created_at?: string | null
          created_by?: string | null
          domain_slugs?: string[] | null
          entity_id?: string | null
          entity_type_slug?: string | null
          id?: string | null
          is_current?: boolean | null
          reasoning?: string | null
          severity?: string | null
        }
        Update: {
          agent_name?: string | null
          agent_version?: string | null
          change_id?: string | null
          classification_method?: string | null
          confidence?: number | null
          created_at?: string | null
          created_by?: string | null
          domain_slugs?: string[] | null
          entity_id?: string | null
          entity_type_slug?: string | null
          id?: string | null
          is_current?: boolean | null
          reasoning?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classification_results_change_id_fkey"
            columns: ["change_id"]
            isOneToOne: false
            referencedRelation: "changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_results_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_results_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_results_entity_type_slug_fkey"
            columns: ["entity_type_slug"]
            isOneToOne: false
            referencedRelation: "kg_entity_types"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "classification_results_entity_type_slug_fkey"
            columns: ["entity_type_slug"]
            isOneToOne: false
            referencedRelation: "v_entity_details"
            referencedColumns: ["entity_type_slug"]
          },
          {
            foreignKeyName: "classification_results_entity_type_slug_fkey"
            columns: ["entity_type_slug"]
            isOneToOne: false
            referencedRelation: "v_entity_types_flat"
            referencedColumns: ["parent_slug"]
          },
          {
            foreignKeyName: "classification_results_entity_type_slug_fkey"
            columns: ["entity_type_slug"]
            isOneToOne: false
            referencedRelation: "v_entity_types_flat"
            referencedColumns: ["slug"]
          },
        ]
      }
      v_entity_details: {
        Row: {
          classification_confidence: number | null
          created_at: string | null
          description: string | null
          domain_names: string[] | null
          domain_slugs: string[] | null
          effective_date: string | null
          entity_type_name: string | null
          entity_type_path: string | null
          entity_type_slug: string | null
          id: string | null
          jurisdiction: string | null
          jurisdiction_codes: string[] | null
          name: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_entity_types_flat: {
        Row: {
          depth: number | null
          description: string | null
          entity_count: number | null
          id: string | null
          is_active: boolean | null
          name: string | null
          parent_name: string | null
          parent_slug: string | null
          path: string | null
          slug: string | null
          sort_order: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      each: { Args: { hs: unknown }; Returns: Record<string, unknown>[] }
      refresh_corpus_facets: { Args: never; Returns: undefined }
      refresh_practice_relevance_summary: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      authority_level_enum:
        | "federal_statute"
        | "federal_regulation"
        | "sub_regulatory_guidance"
        | "national_coverage_determination"
        | "local_coverage_determination"
        | "state_statute"
        | "state_board_rule"
        | "professional_standard"
      relationship_type_enum:
        | "amends"
        | "amended_by"
        | "supersedes"
        | "superseded_by"
        | "implements"
        | "interprets"
        | "cites"
        | "cited_by"
        | "corrects"
        | "part_of"
        | "has_legal_basis"
        | "conflicts_with"
        | "related_to"
        | "delegates_to"
        | "enables"
        | "restricts"
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
    Enums: {
      authority_level_enum: [
        "federal_statute",
        "federal_regulation",
        "sub_regulatory_guidance",
        "national_coverage_determination",
        "local_coverage_determination",
        "state_statute",
        "state_board_rule",
        "professional_standard",
      ],
      relationship_type_enum: [
        "amends",
        "amended_by",
        "supersedes",
        "superseded_by",
        "implements",
        "interprets",
        "cites",
        "cited_by",
        "corrects",
        "part_of",
        "has_legal_basis",
        "conflicts_with",
        "related_to",
        "delegates_to",
        "enables",
        "restricts",
      ],
    },
  },
} as const
