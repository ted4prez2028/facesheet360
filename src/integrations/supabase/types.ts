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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          description: string | null
          earned_at: string | null
          id: string
          reward_amount: number | null
          title: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          description?: string | null
          earned_at?: string | null
          id?: string
          reward_amount?: number | null
          title: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          description?: string | null
          earned_at?: string | null
          id?: string
          reward_amount?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      advanced_directives: {
        Row: {
          created_at: string | null
          created_by: string | null
          details: string | null
          directive_type: string
          document_url: string | null
          effective_date: string | null
          id: string
          patient_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          details?: string | null
          directive_type: string
          document_url?: string | null
          effective_date?: string | null
          id?: string
          patient_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          details?: string | null
          directive_type?: string
          document_url?: string | null
          effective_date?: string | null
          id?: string
          patient_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advanced_directives_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_improvements: {
        Row: {
          code_changes: string | null
          created_at: string | null
          description: string
          id: string
          impact_score: number | null
          improvement_type: string
          status: string | null
        }
        Insert: {
          code_changes?: string | null
          created_at?: string | null
          description: string
          id?: string
          impact_score?: number | null
          improvement_type: string
          status?: string | null
        }
        Update: {
          code_changes?: string | null
          created_at?: string | null
          description?: string
          id?: string
          impact_score?: number | null
          improvement_type?: string
          status?: string | null
        }
        Relationships: []
      }
      allergies: {
        Row: {
          allergen: string
          allergy_type: string | null
          created_at: string | null
          id: string
          noted_at: string | null
          noted_by: string | null
          patient_id: string
          reaction: string | null
          severity: string | null
          status: string | null
        }
        Insert: {
          allergen: string
          allergy_type?: string | null
          created_at?: string | null
          id?: string
          noted_at?: string | null
          noted_by?: string | null
          patient_id: string
          reaction?: string | null
          severity?: string | null
          status?: string | null
        }
        Update: {
          allergen?: string
          allergy_type?: string | null
          created_at?: string | null
          id?: string
          noted_at?: string | null
          noted_by?: string | null
          patient_id?: string
          reaction?: string | null
          severity?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      app_evolution_metrics: {
        Row: {
          id: string
          metric_type: string
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metric_type: string
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_type: string
          created_at: string | null
          created_by: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          notes: string | null
          patient_id: string
          provider_id: string
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          scheduled_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_type: string
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_id: string
          provider_id: string
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          scheduled_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_type?: string
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_id?: string
          provider_id?: string
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          scheduled_time?: string
          status?: string | null
          updated_at?: string | null
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
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          patient_id: string | null
          resource_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          patient_id?: string | null
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          patient_id?: string | null
          resource_id?: string | null
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
      bill_payments: {
        Row: {
          amount: number
          biller_name: string
          care_coins_amount: number
          created_at: string | null
          id: string
          payment_method: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          biller_name: string
          care_coins_amount: number
          created_at?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          biller_name?: string
          care_coins_amount?: number
          created_at?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      call_lights: {
        Row: {
          activated_at: string | null
          id: string
          patient_id: string
          priority: string | null
          reason: string | null
          resolved_at: string | null
          responded_at: string | null
          responded_by: string | null
          response_time_seconds: number | null
          room_number: string
          status: string | null
        }
        Insert: {
          activated_at?: string | null
          id?: string
          patient_id: string
          priority?: string | null
          reason?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_time_seconds?: number | null
          room_number: string
          status?: string | null
        }
        Update: {
          activated_at?: string | null
          id?: string
          patient_id?: string
          priority?: string | null
          reason?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_time_seconds?: number | null
          room_number?: string
          status?: string | null
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
      care_coins_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          from_user_id: string | null
          id: string
          status: string | null
          to_user_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          from_user_id?: string | null
          id?: string
          status?: string | null
          to_user_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          from_user_id?: string | null
          id?: string
          status?: string | null
          to_user_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      care_plans: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string | null
          goals: string | null
          id: string
          interventions: string | null
          patient_id: string
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date?: string | null
          goals?: string | null
          id?: string
          interventions?: string | null
          patient_id: string
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string | null
          goals?: string | null
          id?: string
          interventions?: string | null
          patient_id?: string
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
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
      carecoin_analytics: {
        Row: {
          active_users: number | null
          admin_fees: number | null
          charting_revenue: number | null
          created_at: string | null
          date: string
          id: string
          inflow: number | null
          outflow: number | null
          total_transactions: number | null
          total_volume: number | null
        }
        Insert: {
          active_users?: number | null
          admin_fees?: number | null
          charting_revenue?: number | null
          created_at?: string | null
          date: string
          id?: string
          inflow?: number | null
          outflow?: number | null
          total_transactions?: number | null
          total_volume?: number | null
        }
        Update: {
          active_users?: number | null
          admin_fees?: number | null
          charting_revenue?: number | null
          created_at?: string | null
          date?: string
          id?: string
          inflow?: number | null
          outflow?: number | null
          total_transactions?: number | null
          total_volume?: number | null
        }
        Relationships: []
      }
      carecoin_contract: {
        Row: {
          abi: Json | null
          contract_address: string
          contract_details: Json | null
          created_at: string | null
          deployer_address: string
          id: string
          network: string | null
          transaction_hash: string | null
        }
        Insert: {
          abi?: Json | null
          contract_address: string
          contract_details?: Json | null
          created_at?: string | null
          deployer_address: string
          id?: string
          network?: string | null
          transaction_hash?: string | null
        }
        Update: {
          abi?: Json | null
          contract_address?: string
          contract_details?: Json | null
          created_at?: string | null
          deployer_address?: string
          id?: string
          network?: string | null
          transaction_hash?: string | null
        }
        Relationships: []
      }
      charting_profits: {
        Row: {
          admin_share: number
          chart_record_id: string | null
          chart_type: string
          created_at: string | null
          id: string
          patient_id: string
          patient_share: number
          provider_id: string
          provider_share: number
          status: string | null
          total_amount: number
        }
        Insert: {
          admin_share?: number
          chart_record_id?: string | null
          chart_type: string
          created_at?: string | null
          id?: string
          patient_id: string
          patient_share?: number
          provider_id: string
          provider_share?: number
          status?: string | null
          total_amount?: number
        }
        Update: {
          admin_share?: number
          chart_record_id?: string | null
          chart_type?: string
          created_at?: string | null
          id?: string
          patient_id?: string
          patient_share?: number
          provider_id?: string
          provider_share?: number
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "charting_profits_chart_record_id_fkey"
            columns: ["chart_record_id"]
            isOneToOne: false
            referencedRelation: "patient_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          participant_1_id: string
          participant_2_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          participant_1_id: string
          participant_2_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          participant_1_id?: string
          participant_2_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          created_at: string | null
          evaluated_at: string | null
          evaluated_by: string
          evaluation_type: string
          findings: string | null
          id: string
          patient_id: string
          recommendations: string | null
        }
        Insert: {
          created_at?: string | null
          evaluated_at?: string | null
          evaluated_by: string
          evaluation_type: string
          findings?: string | null
          id?: string
          patient_id: string
          recommendations?: string | null
        }
        Update: {
          created_at?: string | null
          evaluated_at?: string | null
          evaluated_by?: string
          evaluation_type?: string
          findings?: string | null
          id?: string
          patient_id?: string
          recommendations?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      food_orders: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          dietary_restrictions: string[] | null
          id: string
          items: Json
          meal_type: string | null
          ordered_by: string | null
          patient_id: string
          scheduled_time: string | null
          special_instructions: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          dietary_restrictions?: string[] | null
          id?: string
          items: Json
          meal_type?: string | null
          ordered_by?: string | null
          patient_id: string
          scheduled_time?: string | null
          special_instructions?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          dietary_restrictions?: string[] | null
          id?: string
          items?: Json
          meal_type?: string | null
          ordered_by?: string | null
          patient_id?: string
          scheduled_time?: string | null
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
      goal_achievements: {
        Row: {
          achievement_date: string | null
          goal_id: string
          id: string
          patient_id: string
          reward_amount: number
          transaction_id: string | null
        }
        Insert: {
          achievement_date?: string | null
          goal_id: string
          id?: string
          patient_id: string
          reward_amount: number
          transaction_id?: string | null
        }
        Update: {
          achievement_date?: string | null
          goal_id?: string
          id?: string
          patient_id?: string
          reward_amount?: number
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_achievements_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "health_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_achievements_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_achievements_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "care_coins_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      group_calls: {
        Row: {
          created_at: string | null
          id: string
          initiator_id: string
          is_video_call: boolean | null
          participants: Json
          room_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          initiator_id: string
          is_video_call?: boolean | null
          participants: Json
          room_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          initiator_id?: string
          is_video_call?: boolean | null
          participants?: Json
          room_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      health_goals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_value: number
          description: string | null
          end_date: string | null
          goal_type: string
          id: string
          patient_id: string
          reward_amount: number
          start_date: string
          status: string
          target_value: number
          title: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number
          description?: string | null
          end_date?: string | null
          goal_type: string
          id?: string
          patient_id: string
          reward_amount?: number
          start_date?: string
          status?: string
          target_value?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number
          description?: string | null
          end_date?: string | null
          goal_type?: string
          id?: string
          patient_id?: string
          reward_amount?: number
          start_date?: string
          status?: string
          target_value?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_goals_patient_id_fkey"
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
            foreignKeyName: "imaging_studies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      immunizations: {
        Row: {
          administered_at: string
          administered_by: string | null
          created_at: string | null
          dose_number: number | null
          expiration_date: string | null
          id: string
          lot_number: string | null
          notes: string | null
          patient_id: string
          route: string | null
          site: string | null
          vaccine_name: string
        }
        Insert: {
          administered_at: string
          administered_by?: string | null
          created_at?: string | null
          dose_number?: number | null
          expiration_date?: string | null
          id?: string
          lot_number?: string | null
          notes?: string | null
          patient_id: string
          route?: string | null
          site?: string | null
          vaccine_name: string
        }
        Update: {
          administered_at?: string
          administered_by?: string | null
          created_at?: string | null
          dose_number?: number | null
          expiration_date?: string | null
          id?: string
          lot_number?: string | null
          notes?: string | null
          patient_id?: string
          route?: string | null
          site?: string | null
          vaccine_name?: string
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
            foreignKeyName: "lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_diagnoses: {
        Row: {
          created_at: string | null
          diagnosed_by: string | null
          diagnosis_code: string | null
          diagnosis_name: string
          diagnosis_type: string | null
          id: string
          notes: string | null
          onset_date: string | null
          patient_id: string
          resolved_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          diagnosed_by?: string | null
          diagnosis_code?: string | null
          diagnosis_name: string
          diagnosis_type?: string | null
          id?: string
          notes?: string | null
          onset_date?: string | null
          patient_id: string
          resolved_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          diagnosed_by?: string | null
          diagnosis_code?: string | null
          diagnosis_name?: string
          diagnosis_type?: string | null
          id?: string
          notes?: string | null
          onset_date?: string | null
          patient_id?: string
          resolved_date?: string | null
          status?: string | null
          updated_at?: string | null
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
          administered_at: string | null
          administered_by: string | null
          created_at: string | null
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          medication_name: string
          patient_id: string
          prescribed_by: string
          route: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          administered_at?: string | null
          administered_by?: string | null
          created_at?: string | null
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          medication_name: string
          patient_id: string
          prescribed_by: string
          route?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          administered_at?: string | null
          administered_by?: string | null
          created_at?: string | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          medication_name?: string
          patient_id?: string
          prescribed_by?: string
          route?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
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
          author: string | null
          content: string
          conversation_id: string
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_read: boolean | null
          platform: string | null
          recipient_id: string
          sender_id: string
          user_id: string | null
        }
        Insert: {
          author?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          platform?: string | null
          recipient_id: string
          sender_id: string
          user_id?: string | null
        }
        Update: {
          author?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          platform?: string | null
          recipient_id?: string
          sender_id?: string
          user_id?: string | null
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
      notifications: {
        Row: {
          created_at: string | null
          event_id: string | null
          event_time: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          event_time?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          event_time?: string | null
          id?: string
          message?: string
          read?: boolean | null
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
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to: string
          id?: string
          notes?: string | null
          patient_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string
          id?: string
          notes?: string | null
          patient_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
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
          carecoins_distributed: boolean | null
          created_at: string | null
          created_by: string
          id: string
          is_locked: boolean | null
          note_content: string
          note_type: string | null
          patient_id: string
          updated_at: string | null
        }
        Insert: {
          carecoins_distributed?: boolean | null
          created_at?: string | null
          created_by: string
          id?: string
          is_locked?: boolean | null
          note_content: string
          note_type?: string | null
          patient_id: string
          updated_at?: string | null
        }
        Update: {
          carecoins_distributed?: boolean | null
          created_at?: string | null
          created_by?: string
          id?: string
          is_locked?: boolean | null
          note_content?: string
          note_type?: string | null
          patient_id?: string
          updated_at?: string | null
        }
        Relationships: [
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
          created_at: string | null
          heart_rate: number | null
          height: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          pain_scale: number | null
          patient_id: string
          recorded_at: string | null
          recorded_by: string
          respiratory_rate: number | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pain_scale?: number | null
          patient_id: string
          recorded_at?: string | null
          recorded_by: string
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pain_scale?: number | null
          patient_id?: string
          recorded_at?: string | null
          recorded_by?: string
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
          admission_date: string | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          discharge_date: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          facial_data: string | null
          gender: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          medical_record_number: string | null
          name: string
          phone: string | null
          primary_physician: string | null
          room_number: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          discharge_date?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          facial_data?: string | null
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          medical_record_number?: string | null
          name: string
          phone?: string | null
          primary_physician?: string | null
          room_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          discharge_date?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          facial_data?: string | null
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          medical_record_number?: string | null
          name?: string
          phone?: string | null
          primary_physician?: string | null
          room_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          care_coins_balance: number | null
          created_at: string | null
          email: string | null
          id: string
          last_seen: string | null
          name: string | null
          online_status: boolean | null
          organization: string | null
          role: string | null
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          care_coins_balance?: number | null
          created_at?: string | null
          email?: string | null
          id: string
          last_seen?: string | null
          name?: string | null
          online_status?: boolean | null
          organization?: string | null
          role?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          care_coins_balance?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_seen?: string | null
          name?: string | null
          online_status?: boolean | null
          organization?: string | null
          role?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rides: {
        Row: {
          actual_dropoff_time: string | null
          actual_pickup_time: string | null
          created_at: string | null
          driver_name: string | null
          dropoff_location: string
          estimated_arrival: string | null
          estimated_arrival_time: string | null
          estimated_cost_carecoins: number | null
          id: string
          patient_id: string | null
          pickup_location: string
          ride_type: string | null
          scheduled_time: string
          status: string | null
          updated_at: string | null
          user_id: string
          vehicle_info: string | null
        }
        Insert: {
          actual_dropoff_time?: string | null
          actual_pickup_time?: string | null
          created_at?: string | null
          driver_name?: string | null
          dropoff_location: string
          estimated_arrival?: string | null
          estimated_arrival_time?: string | null
          estimated_cost_carecoins?: number | null
          id?: string
          patient_id?: string | null
          pickup_location: string
          ride_type?: string | null
          scheduled_time: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          vehicle_info?: string | null
        }
        Update: {
          actual_dropoff_time?: string | null
          actual_pickup_time?: string | null
          created_at?: string | null
          driver_name?: string | null
          dropoff_location?: string
          estimated_arrival?: string | null
          estimated_arrival_time?: string | null
          estimated_cost_carecoins?: number | null
          id?: string
          patient_id?: string | null
          pickup_location?: string
          ride_type?: string | null
          scheduled_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          vehicle_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string
          category: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          patient_id: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to: string
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          patient_id?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          patient_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
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
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wound_assessments: {
        Row: {
          ai_analysis: string | null
          assessed_at: string | null
          assessed_by: string
          created_at: string | null
          depth_cm: number | null
          drainage_amount: string | null
          drainage_type: string | null
          id: string
          image_url: string | null
          length_cm: number | null
          notes: string | null
          odor: boolean | null
          pain_level: number | null
          patient_id: string
          stage: string | null
          surrounding_skin: string | null
          treatment: string | null
          width_cm: number | null
          wound_location: string
          wound_type: string | null
        }
        Insert: {
          ai_analysis?: string | null
          assessed_at?: string | null
          assessed_by: string
          created_at?: string | null
          depth_cm?: number | null
          drainage_amount?: string | null
          drainage_type?: string | null
          id?: string
          image_url?: string | null
          length_cm?: number | null
          notes?: string | null
          odor?: boolean | null
          pain_level?: number | null
          patient_id: string
          stage?: string | null
          surrounding_skin?: string | null
          treatment?: string | null
          width_cm?: number | null
          wound_location: string
          wound_type?: string | null
        }
        Update: {
          ai_analysis?: string | null
          assessed_at?: string | null
          assessed_by?: string
          created_at?: string | null
          depth_cm?: number | null
          drainage_amount?: string | null
          drainage_type?: string | null
          id?: string
          image_url?: string | null
          length_cm?: number | null
          notes?: string | null
          odor?: boolean | null
          pain_level?: number | null
          patient_id?: string
          stage?: string | null
          surrounding_skin?: string | null
          treatment?: string | null
          width_cm?: number | null
          wound_location?: string
          wound_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wound_assessments_patient_id_fkey"
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_balance: {
        Args: { amount: number; user_id: string }
        Returns: undefined
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
        | "patient"
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
      app_role: [
        "admin",
        "doctor",
        "nurse",
        "therapist",
        "cna",
        "pharmacist",
        "patient",
      ],
    },
  },
} as const
