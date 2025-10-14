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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_improvements: {
        Row: {
          code_changes: string | null
          completion_time: string | null
          created_at: string
          description: string
          error_message: string | null
          files_modified: Json | null
          id: string
          impact_score: number | null
          implementation_status: string
          implementation_time: string | null
          improvement_type: string
          title: string
          updated_at: string
        }
        Insert: {
          code_changes?: string | null
          completion_time?: string | null
          created_at?: string
          description: string
          error_message?: string | null
          files_modified?: Json | null
          id?: string
          impact_score?: number | null
          implementation_status?: string
          implementation_time?: string | null
          improvement_type: string
          title: string
          updated_at?: string
        }
        Update: {
          code_changes?: string | null
          completion_time?: string | null
          created_at?: string
          description?: string
          error_message?: string | null
          files_modified?: Json | null
          id?: string
          impact_score?: number | null
          implementation_status?: string
          implementation_time?: string | null
          improvement_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_data: {
        Row: {
          created_at: string | null
          date: string
          id: string
          metric_type: string
          metric_value: number
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          metric_type: string
          metric_value?: number
          platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          metric_type?: string
          metric_value?: number
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      app_evolution_metrics: {
        Row: {
          accessibility_improvements: number | null
          avg_impact_score: number | null
          bug_fixes: number | null
          created_at: string
          feature_additions: number | null
          files_modified: number | null
          id: string
          lines_of_code_added: number | null
          metric_date: string
          performance_improvements: number | null
          total_improvements: number | null
          ui_improvements: number | null
        }
        Insert: {
          accessibility_improvements?: number | null
          avg_impact_score?: number | null
          bug_fixes?: number | null
          created_at?: string
          feature_additions?: number | null
          files_modified?: number | null
          id?: string
          lines_of_code_added?: number | null
          metric_date?: string
          performance_improvements?: number | null
          total_improvements?: number | null
          ui_improvements?: number | null
        }
        Update: {
          accessibility_improvements?: number | null
          avg_impact_score?: number | null
          bug_fixes?: number | null
          created_at?: string
          feature_additions?: number | null
          files_modified?: number | null
          id?: string
          lines_of_code_added?: number | null
          metric_date?: string
          performance_improvements?: number | null
          total_improvements?: number | null
          ui_improvements?: number | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          provider_id: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          provider_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          provider_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_details: Json | null
          created_at: string
          event_type: string
          id: string
          ip_address: unknown | null
          patient_id: string | null
          resource_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          patient_id?: string | null
          resource_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          patient_id?: string | null
          resource_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_attempts: {
        Row: {
          created_at: string
          failure_reason: string | null
          id: string
          ip_address: unknown | null
          success: boolean
          user_agent: string | null
          user_email: string | null
        }
        Insert: {
          created_at?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_email?: string | null
        }
        Update: {
          created_at?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
      auto_post_settings: {
        Row: {
          created_at: string
          enabled: boolean | null
          id: string
          posts_per_day: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          id?: string
          posts_per_day?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          id?: string
          posts_per_day?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      call_lights: {
        Row: {
          activated_at: string
          id: string
          notes: string | null
          patient_id: string | null
          reason: string | null
          resolved_at: string | null
          responded_at: string | null
          responded_by: string | null
          room_number: string | null
          status: string | null
          urgency_level: string | null
        }
        Insert: {
          activated_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          reason?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          responded_by?: string | null
          room_number?: string | null
          status?: string | null
          urgency_level?: string | null
        }
        Update: {
          activated_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          reason?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          responded_by?: string | null
          room_number?: string | null
          status?: string | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_lights_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      care_coins_achievements: {
        Row: {
          achieved_at: string
          achievement_type: string
          created_at: string
          description: string | null
          id: string
          reward_amount: number
          title: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          achievement_type: string
          created_at?: string
          description?: string | null
          id?: string
          reward_amount: number
          title: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          achievement_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reward_amount?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      care_coins_bill_payments: {
        Row: {
          amount: number
          bill_info: Json | null
          bill_type: string
          created_at: string
          id: string
          recipient_account: string
          recipient_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bill_info?: Json | null
          bill_type: string
          created_at?: string
          id?: string
          recipient_account: string
          recipient_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bill_info?: Json | null
          bill_type?: string
          created_at?: string
          id?: string
          recipient_account?: string
          recipient_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      care_coins_cards: {
        Row: {
          card_type: string
          created_at: string
          id: string
          limit_amount: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_type?: string
          created_at?: string
          id?: string
          limit_amount?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_type?: string
          created_at?: string
          id?: string
          limit_amount?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      care_coins_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          from_user_id: string | null
          id: string
          metadata: Json | null
          reward_category: string | null
          to_user_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          from_user_id?: string | null
          id?: string
          metadata?: Json | null
          reward_category?: string | null
          to_user_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          from_user_id?: string | null
          id?: string
          metadata?: Json | null
          reward_category?: string | null
          to_user_id?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      care_plans: {
        Row: {
          ai_generated: boolean | null
          created_at: string
          created_by: string | null
          description: string | null
          goals: string[] | null
          id: string
          interventions: string[] | null
          patient_id: string | null
          start_date: string
          status: string | null
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          goals?: string[] | null
          id?: string
          interventions?: string[] | null
          patient_id?: string | null
          start_date: string
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          goals?: string[] | null
          id?: string
          interventions?: string[] | null
          patient_id?: string | null
          start_date?: string
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      carecoin_contract: {
        Row: {
          abi: Json | null
          contract_address: string
          contract_details: Json | null
          created_at: string
          deployed_by: string | null
          deployer_address: string
          id: string
          network: string
          transaction_hash: string | null
          updated_at: string
        }
        Insert: {
          abi?: Json | null
          contract_address: string
          contract_details?: Json | null
          created_at?: string
          deployed_by?: string | null
          deployer_address: string
          id?: string
          network?: string
          transaction_hash?: string | null
          updated_at?: string
        }
        Update: {
          abi?: Json | null
          contract_address?: string
          contract_details?: Json | null
          created_at?: string
          deployed_by?: string | null
          deployer_address?: string
          id?: string
          network?: string
          transaction_hash?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chart_records: {
        Row: {
          created_at: string
          diagnosis: string | null
          id: string
          medications: Json | null
          notes: string | null
          patient_id: string
          provider_id: string
          record_date: string
          record_type: string
          treatment_plan: string | null
          updated_at: string
          vital_signs: Json | null
          vitals: Json | null
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          id?: string
          medications?: Json | null
          notes?: string | null
          patient_id: string
          provider_id: string
          record_date?: string
          record_type: string
          treatment_plan?: string | null
          updated_at?: string
          vital_signs?: Json | null
          vitals?: Json | null
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          id?: string
          medications?: Json | null
          notes?: string | null
          patient_id?: string
          provider_id?: string
          record_date?: string
          record_type?: string
          treatment_plan?: string | null
          updated_at?: string
          vital_signs?: Json | null
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          platforms: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          platforms?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          platforms?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1_id?: string
          participant_2_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          created_at: string
          credits: number
          currency: string
          id: string
          is_active: boolean
          name: string
          price_cents: number
          revenuecat_product_id: string | null
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string
          credits: number
          currency?: string
          id?: string
          is_active?: boolean
          name: string
          price_cents: number
          revenuecat_product_id?: string | null
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string
          credits?: number
          currency?: string
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          revenuecat_product_id?: string | null
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      credit_purchases: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_id: string
          payment_provider: string
          price_cents: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_id: string
          payment_provider: string
          price_cents: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_id?: string
          payment_provider?: string
          price_cents?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string
          current_location: Json | null
          email: string | null
          id: string
          license_number: string
          license_plate: string
          name: string
          phone: string
          rating: number | null
          status: string
          total_rides: number | null
          updated_at: string
          vehicle_color: string
          vehicle_make: string
          vehicle_model: string
          vehicle_year: number
        }
        Insert: {
          created_at?: string
          current_location?: Json | null
          email?: string | null
          id?: string
          license_number: string
          license_plate: string
          name: string
          phone: string
          rating?: number | null
          status?: string
          total_rides?: number | null
          updated_at?: string
          vehicle_color: string
          vehicle_make: string
          vehicle_model: string
          vehicle_year: number
        }
        Update: {
          created_at?: string
          current_location?: Json | null
          email?: string | null
          id?: string
          license_number?: string
          license_plate?: string
          name?: string
          phone?: string
          rating?: number | null
          status?: string
          total_rides?: number | null
          updated_at?: string
          vehicle_color?: string
          vehicle_make?: string
          vehicle_model?: string
          vehicle_year?: number
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          created_at: string
          endpoint: string | null
          error_message: string | null
          error_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          severity: string | null
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          error_message?: string | null
          error_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          severity?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          error_message?: string | null
          error_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          severity?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      food_orders: {
        Row: {
          created_at: string
          delivery_time: string | null
          dietary_restrictions: string[] | null
          id: string
          items: Json
          meal_type: string | null
          order_date: string
          ordered_by: string | null
          patient_id: string | null
          special_instructions: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          delivery_time?: string | null
          dietary_restrictions?: string[] | null
          id?: string
          items: Json
          meal_type?: string | null
          order_date?: string
          ordered_by?: string | null
          patient_id?: string | null
          special_instructions?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          delivery_time?: string | null
          dietary_restrictions?: string[] | null
          id?: string
          items?: Json
          meal_type?: string | null
          order_date?: string
          ordered_by?: string | null
          patient_id?: string | null
          special_instructions?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      health_predictions: {
        Row: {
          confidence_score: number
          created_at: string
          id: string
          model_version: string
          patient_id: string
          prediction_data: Json
          prediction_type: string
          status: string
          updated_at: string
        }
        Insert: {
          confidence_score: number
          created_at?: string
          id?: string
          model_version: string
          patient_id: string
          prediction_data: Json
          prediction_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          id?: string
          model_version?: string
          patient_id?: string
          prediction_data?: Json
          prediction_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_predictions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      imaging_studies: {
        Row: {
          body_part: string | null
          created_at: string | null
          findings: string | null
          id: string
          image_url: string | null
          impression: string | null
          modality: string | null
          notes: string | null
          ordered_by: string | null
          patient_id: string
          performed_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          study_type: string
          updated_at: string | null
        }
        Insert: {
          body_part?: string | null
          created_at?: string | null
          findings?: string | null
          id?: string
          image_url?: string | null
          impression?: string | null
          modality?: string | null
          notes?: string | null
          ordered_by?: string | null
          patient_id: string
          performed_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          study_type: string
          updated_at?: string | null
        }
        Update: {
          body_part?: string | null
          created_at?: string | null
          findings?: string | null
          id?: string
          image_url?: string | null
          impression?: string | null
          modality?: string | null
          notes?: string | null
          ordered_by?: string | null
          patient_id?: string
          performed_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          study_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imaging_studies_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_studies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_studies_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      immunizations: {
        Row: {
          created_at: string
          cvx_code: string | null
          date_administered: string | null
          id: string
          patient_id: string
          source: string | null
          status: string
          updated_at: string
          vaccine: string
        }
        Insert: {
          created_at?: string
          cvx_code?: string | null
          date_administered?: string | null
          id?: string
          patient_id: string
          source?: string | null
          status?: string
          updated_at?: string
          vaccine: string
        }
        Update: {
          created_at?: string
          cvx_code?: string | null
          date_administered?: string | null
          id?: string
          patient_id?: string
          source?: string | null
          status?: string
          updated_at?: string
          vaccine?: string
        }
        Relationships: [
          {
            foreignKeyName: "immunizations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          ordered_by: string | null
          patient_id: string
          performed_at: string | null
          reference_range: string | null
          result_unit: string | null
          result_value: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          test_category: string | null
          test_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          ordered_by?: string | null
          patient_id: string
          performed_at?: string | null
          reference_range?: string | null
          result_unit?: string | null
          result_value?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          test_category?: string | null
          test_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          ordered_by?: string | null
          patient_id?: string
          performed_at?: string | null
          reference_range?: string | null
          result_unit?: string | null
          result_value?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          test_category?: string | null
          test_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_diagnoses: {
        Row: {
          category: string | null
          classification: string | null
          clinical_category: string | null
          code: string
          created_at: string
          date: string | null
          description: string
          id: string
          patient_id: string
          pdmp_comorbidities: string | null
          rank: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          classification?: string | null
          clinical_category?: string | null
          code: string
          created_at?: string
          date?: string | null
          description: string
          id?: string
          patient_id: string
          pdmp_comorbidities?: string | null
          rank?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          classification?: string | null
          clinical_category?: string | null
          code?: string
          created_at?: string
          date?: string | null
          description?: string
          id?: string
          patient_id?: string
          pdmp_comorbidities?: string | null
          rank?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_diagnoses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_orders: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          medication_name: string
          patient_id: string | null
          prescribed_by: string | null
          route: string | null
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          medication_name: string
          patient_id?: string | null
          prescribed_by?: string | null
          route?: string | null
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          medication_name?: string
          patient_id?: string | null
          prescribed_by?: string | null
          route?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          author: string
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          platform: string
          recipient_id: string | null
          replied: boolean | null
          replied_at: string | null
          reply_content: string | null
          sender_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author: string
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          platform: string
          recipient_id?: string | null
          replied?: boolean | null
          replied_at?: string | null
          reply_content?: string | null
          sender_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          platform?: string
          recipient_id?: string | null
          replied?: boolean | null
          replied_at?: string | null
          reply_content?: string | null
          sender_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          app_notification_sent: boolean
          created_at: string
          email_address: string | null
          email_sent: boolean
          id: string
          message: string
          notification_type: string
          patient_id: string | null
          phone_number: string | null
          sms_sent: boolean
          user_id: string | null
        }
        Insert: {
          app_notification_sent?: boolean
          created_at?: string
          email_address?: string | null
          email_sent?: boolean
          id?: string
          message: string
          notification_type: string
          patient_id?: string | null
          phone_number?: string | null
          sms_sent?: boolean
          user_id?: string | null
        }
        Update: {
          app_notification_sent?: boolean
          created_at?: string
          email_address?: string | null
          email_sent?: boolean
          id?: string
          message?: string
          notification_type?: string
          patient_id?: string | null
          phone_number?: string | null
          sms_sent?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          event_id: string | null
          event_time: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          event_time?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          event_time?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string
          id: string
          notes: string | null
          patient_id: string
          role: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to: string
          id?: string
          notes?: string | null
          patient_id: string
          role: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string
          id?: string
          notes?: string | null
          patient_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_notes: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          is_locked: boolean | null
          note_content: string
          note_type: string
          patient_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          is_locked?: boolean | null
          note_content: string
          note_type: string
          patient_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          is_locked?: boolean | null
          note_content?: string
          note_type?: string
          patient_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_vitals: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string
          heart_rate: number | null
          height: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          pain_scale: number | null
          patient_id: string | null
          recorded_at: string
          recorded_by: string | null
          respiratory_rate: number | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pain_scale?: number | null
          patient_id?: string | null
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pain_scale?: number | null
          patient_id?: string | null
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          created_at: string
          date_of_birth: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          facial_data: string | null
          first_name: string
          gender: string
          id: string
          insurance_number: string | null
          insurance_provider: string | null
          last_name: string
          medical_history: string | null
          medical_record_number: string | null
          medications: string | null
          notes: string | null
          phone: string | null
          room_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          created_at?: string
          date_of_birth: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          facial_data?: string | null
          first_name: string
          gender: string
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          last_name: string
          medical_history?: string | null
          medical_record_number?: string | null
          medications?: string | null
          notes?: string | null
          phone?: string | null
          room_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string | null
          created_at?: string
          date_of_birth?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          facial_data?: string | null
          first_name?: string
          gender?: string
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          last_name?: string
          medical_history?: string | null
          medical_record_number?: string | null
          medications?: string | null
          notes?: string | null
          phone?: string | null
          room_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          external_payment_id: string | null
          id: string
          payment_data: Json | null
          payment_method: string
          payment_status: string
          subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          external_payment_id?: string | null
          id?: string
          payment_data?: Json | null
          payment_method: string
          payment_status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          external_payment_id?: string | null
          id?: string
          payment_data?: Json | null
          payment_method?: string
          payment_status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          engagement_data: Json | null
          id: string
          platforms: string[] | null
          published_at: string | null
          scheduled_for: string | null
          scheduled_time: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          engagement_data?: Json | null
          id?: string
          platforms?: string[] | null
          published_at?: string | null
          scheduled_for?: string | null
          scheduled_time?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          engagement_data?: Json | null
          id?: string
          platforms?: string[] | null
          published_at?: string | null
          scheduled_for?: string | null
          scheduled_time?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          administered_at: string | null
          administered_by: string | null
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          medication_name: string
          patient_id: string
          provider_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          administered_at?: string | null
          administered_by?: string | null
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          medication_name: string
          patient_id: string
          provider_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          administered_at?: string | null
          administered_by?: string | null
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          medication_name?: string
          patient_id?: string
          provider_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          actual_cost_carecoins: number | null
          created_at: string
          driver_id: string | null
          driver_name: string | null
          driver_phone: string | null
          dropoff_location: string
          dropoff_time: string | null
          estimated_arrival_time: string | null
          estimated_cost_carecoins: number
          id: string
          patient_id: string | null
          pickup_location: string
          pickup_time: string | null
          ride_type: string
          route_data: Json | null
          scheduled_time: string | null
          status: string
          updated_at: string
          user_id: string
          vehicle_info: string | null
        }
        Insert: {
          actual_cost_carecoins?: number | null
          created_at?: string
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          dropoff_location: string
          dropoff_time?: string | null
          estimated_arrival_time?: string | null
          estimated_cost_carecoins?: number
          id?: string
          patient_id?: string | null
          pickup_location: string
          pickup_time?: string | null
          ride_type: string
          route_data?: Json | null
          scheduled_time?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vehicle_info?: string | null
        }
        Update: {
          actual_cost_carecoins?: number | null
          created_at?: string
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          dropoff_location?: string
          dropoff_time?: string | null
          estimated_arrival_time?: string | null
          estimated_cost_carecoins?: number
          id?: string
          patient_id?: string | null
          pickup_location?: string
          pickup_time?: string | null
          ride_type?: string
          route_data?: Json | null
          scheduled_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vehicle_info?: string | null
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          platform_user_id: string
          refresh_token: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          platform_user_id: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          platform_user_id?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          expires_at: string | null
          id: string
          payment_id: string | null
          payment_method: string | null
          plan_id: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          plan_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          plan_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_health_metrics: {
        Row: {
          created_at: string
          daily_appointments: number | null
          error_rate: number | null
          id: string
          last_updated: string
          metric_date: string
          system_uptime: unknown | null
          total_patients: number | null
          total_users: number | null
        }
        Insert: {
          created_at?: string
          daily_appointments?: number | null
          error_rate?: number | null
          id?: string
          last_updated?: string
          metric_date: string
          system_uptime?: unknown | null
          total_patients?: number | null
          total_users?: number | null
        }
        Update: {
          created_at?: string
          daily_appointments?: number | null
          error_rate?: number | null
          id?: string
          last_updated?: string
          metric_date?: string
          system_uptime?: unknown | null
          total_patients?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          frequency: string | null
          id: string
          patient_id: string
          position: string | null
          status: string
          task_description: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          frequency?: string | null
          id?: string
          patient_id: string
          position?: string | null
          status?: string
          task_description: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          frequency?: string | null
          id?: string
          patient_id?: string
          position?: string | null
          status?: string
          task_description?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_oauth_configs: {
        Row: {
          client_id: string
          client_secret: string
          created_at: string
          id: string
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          client_secret: string
          created_at?: string
          id?: string
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          client_secret?: string
          created_at?: string
          id?: string
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          care_coins_balance: number | null
          created_at: string
          credits: number | null
          email: string | null
          id: string
          is_admin: boolean | null
          last_seen: string | null
          name: string | null
          online_status: boolean | null
          organization: string | null
          remaining_credits: number | null
          role: string | null
          specialty: string | null
          total_credits: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          care_coins_balance?: number | null
          created_at?: string
          credits?: number | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          last_seen?: string | null
          name?: string | null
          online_status?: boolean | null
          organization?: string | null
          remaining_credits?: number | null
          role?: string | null
          specialty?: string | null
          total_credits?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          care_coins_balance?: number | null
          created_at?: string
          credits?: number | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          last_seen?: string | null
          name?: string | null
          online_status?: boolean | null
          organization?: string | null
          remaining_credits?: number | null
          role?: string | null
          specialty?: string | null
          total_credits?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vital_signs: {
        Row: {
          blood_pressure: string | null
          created_at: string
          date_recorded: string
          heart_rate: number | null
          height: number | null
          id: string
          oxygen_saturation: number | null
          patient_id: string
          respiratory_rate: number | null
          temperature: number | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          blood_pressure?: string | null
          created_at?: string
          date_recorded?: string
          heart_rate?: number | null
          height?: number | null
          id?: string
          oxygen_saturation?: number | null
          patient_id: string
          respiratory_rate?: number | null
          temperature?: number | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          blood_pressure?: string | null
          created_at?: string
          date_recorded?: string
          heart_rate?: number | null
          height?: number | null
          id?: string
          oxygen_saturation?: number | null
          patient_id?: string
          respiratory_rate?: number | null
          temperature?: number | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vital_signs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      wounds: {
        Row: {
          assessment: string | null
          created_at: string
          description: string
          healing_status: string | null
          id: string
          image_url: string
          infection_status: string | null
          location: string
          patient_id: string
          stage: string | null
          updated_at: string
        }
        Insert: {
          assessment?: string | null
          created_at?: string
          description: string
          healing_status?: string | null
          id?: string
          image_url: string
          infection_status?: string | null
          location: string
          patient_id: string
          stage?: string | null
          updated_at?: string
        }
        Update: {
          assessment?: string | null
          created_at?: string
          description?: string
          healing_status?: string | null
          id?: string
          image_url?: string
          infection_status?: string | null
          location?: string
          patient_id?: string
          stage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wounds_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits_after_payment: {
        Args: {
          p_credits: number
          p_payment_id: string
          p_provider: string
          p_user_id: string
        }
        Returns: boolean
      }
      analyze_tables: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      assess_health_risks: {
        Args: { assessment_data: Json; patient_id_param: string }
        Returns: Json
      }
      assign_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      create_admin_doctor_account: {
        Args: { _email: string; _name?: string; _password: string }
        Returns: Json
      }
      create_subscription_checkout: {
        Args: {
          guest_checkout?: boolean
          payment_method: string
          plan_id: string
          plan_name: string
          price: number
        }
        Returns: Json
      }
      distribute_care_coins_reward: {
        Args: {
          p_amount: number
          p_description?: string
          p_patient_id: string
          p_provider_id: string
          p_reward_category: string
        }
        Returns: boolean
      }
      get_analytics_overview: {
        Args: { provider_id_param: string; timeframe_param: string }
        Returns: {
          appointments: number
          appointmentsgrowth: number
          carecoinsgenerated: number
          carecoinsgrowth: number
          chartingrate: number
          chartingrategrowth: number
          patientsgrowth: number
          totalpatients: number
        }[]
      }
      get_appointment_analytics: {
        Args: { provider_id_param: string; timeframe_param: string }
        Returns: {
          cancelled: number
          completed: number
          month: string
          scheduled: number
        }[]
      }
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_care_coins_analytics: {
        Args: { timeframe_param: string; user_id_param: string }
        Returns: {
          earned: number
          month: string
          spent: number
        }[]
      }
      get_common_diagnoses: {
        Args: Record<PropertyKey, never>
        Returns: {
          name: string
          value: number
        }[]
      }
      get_dashboard_statistics: {
        Args: { user_id_param: string }
        Returns: Json
      }
      get_patient_demographics: {
        Args: Record<PropertyKey, never>
        Returns: {
          name: string
          value: number
        }[]
      }
      get_patient_trends: {
        Args: { timeframe_param: string }
        Returns: {
          activepatients: number
          discharge: number
          month: string
          newpatients: number
        }[]
      }
      get_provider_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          "Dr. Brown": number
          "Dr. Johnson": number
          "Dr. Smith": number
          "Dr. Williams": number
          name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_own_profile: {
        Args: { user_id: string }
        Returns: boolean
      }
      user_can_access_patients: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "therapist"
        | "cna"
        | "pharmacist"
      order_status:
        | "pending"
        | "approved"
        | "preparing"
        | "delivered"
        | "cancelled"
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
      app_role: ["admin", "doctor", "nurse", "therapist", "cna", "pharmacist"],
      order_status: [
        "pending",
        "approved",
        "preparing",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
