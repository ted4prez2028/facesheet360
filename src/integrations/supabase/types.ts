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
      advanced_directives: {
        Row: {
          created_at: string | null
          directive_type: string
          document_url: string | null
          effective_date: string | null
          expiration_date: string | null
          healthcare_proxy_name: string | null
          healthcare_proxy_phone: string | null
          id: string
          notes: string | null
          patient_id: string
          recorded_by: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          directive_type: string
          document_url?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          healthcare_proxy_name?: string | null
          healthcare_proxy_phone?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          recorded_by?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          directive_type?: string
          document_url?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          healthcare_proxy_name?: string | null
          healthcare_proxy_phone?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          recorded_by?: string | null
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
      allergies: {
        Row: {
          allergen: string
          created_at: string | null
          id: string
          patient_id: string
          reaction: string | null
          recorded_at: string | null
          recorded_by: string | null
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          allergen: string
          created_at?: string | null
          id?: string
          patient_id: string
          reaction?: string | null
          recorded_at?: string | null
          recorded_by?: string | null
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          allergen?: string
          created_at?: string | null
          id?: string
          patient_id?: string
          reaction?: string | null
          recorded_at?: string | null
          recorded_by?: string | null
          severity?: string | null
          updated_at?: string | null
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
      appointment_reminders: {
        Row: {
          appointment_id: string
          created_at: string | null
          delivery_status: string | null
          error_message: string | null
          id: string
          message_content: string | null
          patient_id: string
          reminder_type: string | null
          scheduled_for: string
          sent_at: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          patient_id: string
          reminder_type?: string | null
          scheduled_for: string
          sent_at?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          patient_id?: string
          reminder_type?: string | null
          scheduled_for?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_reminders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_waitlist: {
        Row: {
          added_by: string | null
          appointment_type: string
          created_at: string | null
          id: string
          notes: string | null
          patient_id: string
          preferred_date_end: string | null
          preferred_date_start: string | null
          preferred_time_of_day: string | null
          priority: string | null
          provider_id: string | null
          scheduled_appointment_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          added_by?: string | null
          appointment_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          preferred_date_end?: string | null
          preferred_date_start?: string | null
          preferred_time_of_day?: string | null
          priority?: string | null
          provider_id?: string | null
          scheduled_appointment_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          added_by?: string | null
          appointment_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          preferred_date_end?: string | null
          preferred_date_start?: string | null
          preferred_time_of_day?: string | null
          priority?: string | null
          provider_id?: string | null
          scheduled_appointment_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_waitlist_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_waitlist_scheduled_appointment_id_fkey"
            columns: ["scheduled_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_type: string | null
          created_at: string | null
          id: string
          notes: string | null
          patient_id: string | null
          provider_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_type?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          provider_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_type?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          provider_id?: string | null
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
          patient_id: string | null
          resource_id: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          created_at?: string | null
          event_type: string
          id?: string
          patient_id?: string | null
          resource_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          created_at?: string | null
          event_type?: string
          id?: string
          patient_id?: string | null
          resource_id?: string | null
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
      beta_testers: {
        Row: {
          bugs_reported: number | null
          completed_at: string | null
          created_at: string | null
          features_tested: number | null
          feedback_count: number | null
          id: string
          invitation_code: string | null
          invited_by: string | null
          joined_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bugs_reported?: number | null
          completed_at?: string | null
          created_at?: string | null
          features_tested?: number | null
          feedback_count?: number | null
          id?: string
          invitation_code?: string | null
          invited_by?: string | null
          joined_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bugs_reported?: number | null
          completed_at?: string | null
          created_at?: string | null
          features_tested?: number | null
          feedback_count?: number | null
          id?: string
          invitation_code?: string | null
          invited_by?: string | null
          joined_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bill_payments: {
        Row: {
          bill_amount: number
          carecoins_used: number
          created_at: string | null
          id: string
          metadata: Json | null
          patient_id: string | null
          payment_method: string
          payment_status: string | null
          transaction_hash: string | null
          updated_at: string | null
          usd_equivalent: number
          user_id: string
        }
        Insert: {
          bill_amount: number
          carecoins_used: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          payment_method: string
          payment_status?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
          usd_equivalent: number
          user_id: string
        }
        Update: {
          bill_amount?: number
          carecoins_used?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          payment_method?: string
          payment_status?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
          usd_equivalent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      call_lights: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          patient_id: string
          priority: string | null
          reason: string | null
          requested_at: string | null
          resolved_at: string | null
          responded_at: string | null
          responded_by: string | null
          response_time_minutes: number | null
          room_number: string
          status: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          priority?: string | null
          reason?: string | null
          requested_at?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_time_minutes?: number | null
          room_number: string
          status?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          priority?: string | null
          reason?: string | null
          requested_at?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_time_minutes?: number | null
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
      capacity_metrics: {
        Row: {
          available_beds: number
          average_length_of_stay: number | null
          bed_turnover_rate: number | null
          created_at: string | null
          discharges: number | null
          emergency_admissions: number | null
          icu_beds: number | null
          id: string
          metric_date: string
          occupancy_rate: number | null
          occupied_beds: number
          occupied_icu_beds: number | null
          predicted_admissions_next_24h: number | null
          predicted_discharges_next_24h: number | null
          recorded_by: string | null
          scheduled_admissions: number | null
          staffing_level: number | null
          total_beds: number
        }
        Insert: {
          available_beds: number
          average_length_of_stay?: number | null
          bed_turnover_rate?: number | null
          created_at?: string | null
          discharges?: number | null
          emergency_admissions?: number | null
          icu_beds?: number | null
          id?: string
          metric_date: string
          occupancy_rate?: number | null
          occupied_beds: number
          occupied_icu_beds?: number | null
          predicted_admissions_next_24h?: number | null
          predicted_discharges_next_24h?: number | null
          recorded_by?: string | null
          scheduled_admissions?: number | null
          staffing_level?: number | null
          total_beds: number
        }
        Update: {
          available_beds?: number
          average_length_of_stay?: number | null
          bed_turnover_rate?: number | null
          created_at?: string | null
          discharges?: number | null
          emergency_admissions?: number | null
          icu_beds?: number | null
          id?: string
          metric_date?: string
          occupancy_rate?: number | null
          occupied_beds?: number
          occupied_icu_beds?: number | null
          predicted_admissions_next_24h?: number | null
          predicted_discharges_next_24h?: number | null
          recorded_by?: string | null
          scheduled_admissions?: number | null
          staffing_level?: number | null
          total_beds?: number
        }
        Relationships: []
      }
      care_coins_transactions: {
        Row: {
          amount: number
          created_at: string | null
          from_user_id: string | null
          id: string
          metadata: Json | null
          status: string | null
          to_user_id: string | null
          transaction_hash: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          to_user_id?: string | null
          transaction_hash?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          to_user_id?: string | null
          transaction_hash?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      care_plans: {
        Row: {
          assessments_schedule: Json | null
          created_at: string | null
          created_by: string
          end_date: string | null
          goals: Json
          id: string
          interventions: Json
          last_reviewed_at: string | null
          last_reviewed_by: string | null
          medications: Json | null
          next_review_date: string | null
          patient_id: string
          plan_type: string
          review_frequency: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assessments_schedule?: Json | null
          created_at?: string | null
          created_by: string
          end_date?: string | null
          goals: Json
          id?: string
          interventions: Json
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
          medications?: Json | null
          next_review_date?: string | null
          patient_id: string
          plan_type: string
          review_frequency?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assessments_schedule?: Json | null
          created_at?: string | null
          created_by?: string
          end_date?: string | null
          goals?: Json
          id?: string
          interventions?: Json
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
          medications?: Json | null
          next_review_date?: string | null
          patient_id?: string
          plan_type?: string
          review_frequency?: string | null
          start_date?: string
          status?: string | null
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
      care_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string
          due_date: string | null
          id: string
          notes: string | null
          patient_id: string
          priority: string | null
          status: string | null
          task_description: string | null
          task_title: string
          task_type: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by: string
          due_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          priority?: string | null
          status?: string | null
          task_description?: string | null
          task_title: string
          task_type?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          priority?: string | null
          status?: string | null
          task_description?: string | null
          task_title?: string
          task_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_tasks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      care_team_members: {
        Row: {
          added_by: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_primary: boolean | null
          notes: string | null
          patient_id: string
          role: string
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          patient_id: string
          role: string
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          patient_id?: string
          role?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_team_members_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      carecoin_contract: {
        Row: {
          abi: Json
          block_number: number | null
          contract_address: string
          contract_name: string | null
          contract_symbol: string | null
          created_at: string | null
          deployer_address: string
          id: string
          network: string
          total_supply: number | null
          transaction_hash: string
        }
        Insert: {
          abi: Json
          block_number?: number | null
          contract_address: string
          contract_name?: string | null
          contract_symbol?: string | null
          created_at?: string | null
          deployer_address: string
          id?: string
          network: string
          total_supply?: number | null
          transaction_hash: string
        }
        Update: {
          abi?: Json
          block_number?: number | null
          contract_address?: string
          contract_name?: string | null
          contract_symbol?: string | null
          created_at?: string | null
          deployer_address?: string
          id?: string
          network?: string
          total_supply?: number | null
          transaction_hash?: string
        }
        Relationships: []
      }
      carecoin_deployment_status: {
        Row: {
          block_number: number | null
          contract_address: string | null
          created_at: string | null
          deployed_at: string | null
          deployed_by: string | null
          deployer_address: string | null
          deployment_cost: number | null
          deployment_phase: string
          error_message: string | null
          gas_used: number | null
          id: string
          liquidity_added: number | null
          liquidity_pool_address: string | null
          network: string
          polygonscan_verified: boolean | null
          status: string
          transaction_hash: string | null
          updated_at: string | null
        }
        Insert: {
          block_number?: number | null
          contract_address?: string | null
          created_at?: string | null
          deployed_at?: string | null
          deployed_by?: string | null
          deployer_address?: string | null
          deployment_cost?: number | null
          deployment_phase: string
          error_message?: string | null
          gas_used?: number | null
          id?: string
          liquidity_added?: number | null
          liquidity_pool_address?: string | null
          network: string
          polygonscan_verified?: boolean | null
          status: string
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          block_number?: number | null
          contract_address?: string | null
          created_at?: string | null
          deployed_at?: string | null
          deployed_by?: string | null
          deployer_address?: string | null
          deployment_cost?: number | null
          deployment_phase?: string
          error_message?: string | null
          gas_used?: number | null
          id?: string
          liquidity_added?: number | null
          liquidity_pool_address?: string | null
          network?: string
          polygonscan_verified?: boolean | null
          status?: string
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      carecoin_merchants: {
        Row: {
          acceptance_rate: number | null
          contact_email: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          merchant_name: string
          merchant_type: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          merchant_name: string
          merchant_type: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          merchant_name?: string
          merchant_type?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      carecoin_rate_limits: {
        Row: {
          created_at: string | null
          id: string
          last_reset_at: string | null
          mint_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_reset_at?: string | null
          mint_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_reset_at?: string | null
          mint_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      carecoin_staking: {
        Row: {
          apy_rate: number
          created_at: string | null
          end_date: string
          id: string
          rewards_earned: number | null
          staked_amount: number
          staking_period_days: number
          start_date: string | null
          status: string | null
          transaction_hash: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          apy_rate: number
          created_at?: string | null
          end_date: string
          id?: string
          rewards_earned?: number | null
          staked_amount: number
          staking_period_days: number
          start_date?: string | null
          status?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          apy_rate?: number
          created_at?: string | null
          end_date?: string
          id?: string
          rewards_earned?: number | null
          staked_amount?: number
          staking_period_days?: number
          start_date?: string | null
          status?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cashout_requests: {
        Row: {
          account_info: Json
          admin_notes: string | null
          amount: number
          created_at: string | null
          exchange_rate: number
          id: string
          payment_method: string
          processed_at: string | null
          processed_by: string | null
          status: string | null
          updated_at: string | null
          usd_amount: number
          user_id: string
        }
        Insert: {
          account_info: Json
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          exchange_rate: number
          id?: string
          payment_method: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          updated_at?: string | null
          usd_amount: number
          user_id: string
        }
        Update: {
          account_info?: Json
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          exchange_rate?: number
          id?: string
          payment_method?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          updated_at?: string | null
          usd_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      charting_profits: {
        Row: {
          admin_share: number | null
          amount: number
          chart_type: string | null
          created_at: string | null
          error_message: string | null
          id: string
          patient_id: string | null
          patient_share: number | null
          processed_at: string | null
          provider_id: string
          provider_share: number | null
          status: string | null
          total_amount: number | null
          transaction_hash: string | null
        }
        Insert: {
          admin_share?: number | null
          amount?: number
          chart_type?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          patient_id?: string | null
          patient_share?: number | null
          processed_at?: string | null
          provider_id: string
          provider_share?: number | null
          status?: string | null
          total_amount?: number | null
          transaction_hash?: string | null
        }
        Update: {
          admin_share?: number | null
          amount?: number
          chart_type?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          patient_id?: string | null
          patient_share?: number | null
          processed_at?: string | null
          provider_id?: string
          provider_share?: number | null
          status?: string | null
          total_amount?: number | null
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charting_profits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          description: string
          id: string
          is_acknowledged: boolean | null
          metadata: Json | null
          patient_id: string
          recommendation: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          title: string
          triggered_by: string | null
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          description: string
          id?: string
          is_acknowledged?: boolean | null
          metadata?: Json | null
          patient_id: string
          recommendation?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          title: string
          triggered_by?: string | null
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          description?: string
          id?: string
          is_acknowledged?: boolean | null
          metadata?: Json | null
          patient_id?: string
          recommendation?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          title?: string
          triggered_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_guidelines: {
        Row: {
          category: string
          condition: string
          created_at: string | null
          evidence_level: string | null
          guideline_title: string
          guideline_url: string | null
          id: string
          is_active: boolean | null
          last_updated: string | null
          publication_date: string | null
          recommendation: string
          source_organization: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          condition: string
          created_at?: string | null
          evidence_level?: string | null
          guideline_title: string
          guideline_url?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          publication_date?: string | null
          recommendation: string
          source_organization?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          condition?: string
          created_at?: string | null
          evidence_level?: string | null
          guideline_title?: string
          guideline_url?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          publication_date?: string | null
          recommendation?: string
          source_organization?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          consultant_name: string
          consultation_date: string
          consultation_type: string
          created_at: string | null
          findings: string | null
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          recommendations: string | null
          requested_by: string | null
          updated_at: string | null
        }
        Insert: {
          consultant_name: string
          consultation_date: string
          consultation_type: string
          created_at?: string | null
          findings?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          recommendations?: string | null
          requested_by?: string | null
          updated_at?: string | null
        }
        Update: {
          consultant_name?: string
          consultation_date?: string
          consultation_type?: string
          created_at?: string | null
          findings?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          recommendations?: string | null
          requested_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
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
      data_retention_policies: {
        Row: {
          archive_after_days: number | null
          compliance_requirement: string | null
          created_at: string | null
          created_by: string | null
          data_type: string
          delete_after_days: number | null
          id: string
          is_active: boolean | null
          policy_description: string | null
          retention_period_days: number
          updated_at: string | null
        }
        Insert: {
          archive_after_days?: number | null
          compliance_requirement?: string | null
          created_at?: string | null
          created_by?: string | null
          data_type: string
          delete_after_days?: number | null
          id?: string
          is_active?: boolean | null
          policy_description?: string | null
          retention_period_days: number
          updated_at?: string | null
        }
        Update: {
          archive_after_days?: number | null
          compliance_requirement?: string | null
          created_at?: string | null
          created_by?: string | null
          data_type?: string
          delete_after_days?: number | null
          id?: string
          is_active?: boolean | null
          policy_description?: string | null
          retention_period_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      discharge_plans: {
        Row: {
          activity_restrictions: string | null
          created_at: string | null
          created_by: string
          dietary_instructions: string | null
          discharge_disposition: string | null
          discharge_location: string | null
          emergency_contacts: Json | null
          equipment_needs: string | null
          follow_up_appointments: Json | null
          home_care_services: Json | null
          id: string
          last_updated_by: string | null
          medications_on_discharge: Json | null
          patient_education_completed: boolean | null
          patient_id: string
          planned_discharge_date: string | null
          transportation_arranged: boolean | null
          updated_at: string | null
          warning_signs: string | null
        }
        Insert: {
          activity_restrictions?: string | null
          created_at?: string | null
          created_by: string
          dietary_instructions?: string | null
          discharge_disposition?: string | null
          discharge_location?: string | null
          emergency_contacts?: Json | null
          equipment_needs?: string | null
          follow_up_appointments?: Json | null
          home_care_services?: Json | null
          id?: string
          last_updated_by?: string | null
          medications_on_discharge?: Json | null
          patient_education_completed?: boolean | null
          patient_id: string
          planned_discharge_date?: string | null
          transportation_arranged?: boolean | null
          updated_at?: string | null
          warning_signs?: string | null
        }
        Update: {
          activity_restrictions?: string | null
          created_at?: string | null
          created_by?: string
          dietary_instructions?: string | null
          discharge_disposition?: string | null
          discharge_location?: string | null
          emergency_contacts?: Json | null
          equipment_needs?: string | null
          follow_up_appointments?: Json | null
          home_care_services?: Json | null
          id?: string
          last_updated_by?: string | null
          medications_on_discharge?: Json | null
          patient_education_completed?: boolean | null
          patient_id?: string
          planned_discharge_date?: string | null
          transportation_arranged?: boolean | null
          updated_at?: string | null
          warning_signs?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discharge_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      discharge_summaries: {
        Row: {
          created_at: string | null
          generated_at: string | null
          generated_by: string
          id: string
          patient_id: string
          pdf_url: string | null
          summary_data: Json
        }
        Insert: {
          created_at?: string | null
          generated_at?: string | null
          generated_by: string
          id?: string
          patient_id: string
          pdf_url?: string | null
          summary_data: Json
        }
        Update: {
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string
          id?: string
          patient_id?: string
          pdf_url?: string | null
          summary_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "discharge_summaries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_ratings: {
        Row: {
          created_at: string | null
          driver_id: string
          id: string
          passenger_id: string
          rating: number
          review: string | null
          ride_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          id?: string
          passenger_id: string
          rating: number
          review?: string | null
          ride_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          id?: string
          passenger_id?: string
          rating?: number
          review?: string | null
          ride_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_ratings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_ratings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          care_coins_balance: number | null
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          id: string
          insurance_expiry: string | null
          insurance_policy: string | null
          is_verified: boolean | null
          license_expiry: string | null
          license_number: string
          license_plate: string
          rating: number | null
          status: string | null
          total_earnings: number | null
          total_ratings: number | null
          total_rides: number | null
          updated_at: string | null
          user_id: string
          vehicle_make: string
          vehicle_model: string
          vehicle_type: string
          vehicle_year: number | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          care_coins_balance?: number | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          insurance_expiry?: string | null
          insurance_policy?: string | null
          is_verified?: boolean | null
          license_expiry?: string | null
          license_number: string
          license_plate: string
          rating?: number | null
          status?: string | null
          total_earnings?: number | null
          total_ratings?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_make: string
          vehicle_model: string
          vehicle_type: string
          vehicle_year?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          care_coins_balance?: number | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          insurance_expiry?: string | null
          insurance_policy?: string | null
          is_verified?: boolean | null
          license_expiry?: string | null
          license_number?: string
          license_plate?: string
          rating?: number | null
          status?: string | null
          total_earnings?: number | null
          total_ratings?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_make?: string
          vehicle_model?: string
          vehicle_type?: string
          vehicle_year?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string | null
          equipment_name: string
          equipment_type: string
          id: string
          last_maintenance_date: string | null
          location: string | null
          manufacturer: string | null
          model: string | null
          next_maintenance_date: string | null
          notes: string | null
          purchase_date: string | null
          serial_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_name: string
          equipment_type: string
          id?: string
          last_maintenance_date?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          next_maintenance_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_name?: string
          equipment_type?: string
          id?: string
          last_maintenance_date?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          next_maintenance_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          created_at: string | null
          evaluation_date: string
          evaluation_type: string
          evaluator_id: string
          findings: Json
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          patient_id: string
          recommendations: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          evaluation_date: string
          evaluation_type: string
          evaluator_id: string
          findings: Json
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          patient_id: string
          recommendations?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          evaluation_date?: string
          evaluation_type?: string
          evaluator_id?: string
          findings?: Json
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          patient_id?: string
          recommendations?: string | null
          status?: string | null
          updated_at?: string | null
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
      external_lab_orders: {
        Row: {
          collection_date: string | null
          created_at: string | null
          external_order_id: string | null
          id: string
          lab_system: string
          order_notes: string | null
          order_status: string | null
          ordered_by: string
          patient_id: string
          priority: string | null
          results_data: Json | null
          results_received: boolean | null
          specimen_type: string | null
          test_codes: string[] | null
          test_names: string[] | null
          updated_at: string | null
        }
        Insert: {
          collection_date?: string | null
          created_at?: string | null
          external_order_id?: string | null
          id?: string
          lab_system: string
          order_notes?: string | null
          order_status?: string | null
          ordered_by: string
          patient_id: string
          priority?: string | null
          results_data?: Json | null
          results_received?: boolean | null
          specimen_type?: string | null
          test_codes?: string[] | null
          test_names?: string[] | null
          updated_at?: string | null
        }
        Update: {
          collection_date?: string | null
          created_at?: string | null
          external_order_id?: string | null
          id?: string
          lab_system?: string
          order_notes?: string | null
          order_status?: string | null
          ordered_by?: string
          patient_id?: string
          priority?: string | null
          results_data?: Json | null
          results_received?: boolean | null
          specimen_type?: string | null
          test_codes?: string[] | null
          test_names?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      external_system_mappings: {
        Row: {
          created_at: string | null
          external_id: string
          external_system: string
          external_type: string | null
          id: string
          internal_id: string
          internal_type: string
          is_active: boolean | null
          last_synced_at: string | null
          mapping_metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_id: string
          external_system: string
          external_type?: string | null
          id?: string
          internal_id: string
          internal_type: string
          is_active?: boolean | null
          last_synced_at?: string | null
          mapping_metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_id?: string
          external_system?: string
          external_type?: string | null
          id?: string
          internal_id?: string
          internal_type?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          mapping_metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      facilities: {
        Row: {
          building: string | null
          capacity: number | null
          created_at: string | null
          equipment_available: string[] | null
          facility_name: string
          facility_type: string | null
          floor: string | null
          id: string
          is_available: boolean | null
          notes: string | null
          room_number: string | null
          updated_at: string | null
        }
        Insert: {
          building?: string | null
          capacity?: number | null
          created_at?: string | null
          equipment_available?: string[] | null
          facility_name: string
          facility_type?: string | null
          floor?: string | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          room_number?: string | null
          updated_at?: string | null
        }
        Update: {
          building?: string | null
          capacity?: number | null
          created_at?: string | null
          equipment_available?: string[] | null
          facility_name?: string
          facility_type?: string | null
          floor?: string | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          room_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      favorite_locations: {
        Row: {
          address: string
          created_at: string | null
          id: string
          latitude: number
          location_type: string | null
          longitude: number
          name: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          latitude: number
          location_type?: string | null
          longitude: number
          name: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          latitude?: number
          location_type?: string | null
          longitude?: number
          name?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          rollout_percentage: number | null
          target_roles: string[] | null
          target_users: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          rollout_percentage?: number | null
          target_roles?: string[] | null
          target_users?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          rollout_percentage?: number | null
          target_roles?: string[] | null
          target_users?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gas_wallet_monitoring: {
        Row: {
          alert_threshold: number | null
          balance: number
          created_at: string | null
          estimated_transactions_remaining: number | null
          gas_price_gwei: number | null
          id: string
          is_low: boolean | null
          last_refill_amount: number | null
          last_refill_at: string | null
          monitored_at: string | null
          network: string
          total_gas_spent: number | null
          transaction_count: number | null
          wallet_address: string
        }
        Insert: {
          alert_threshold?: number | null
          balance: number
          created_at?: string | null
          estimated_transactions_remaining?: number | null
          gas_price_gwei?: number | null
          id?: string
          is_low?: boolean | null
          last_refill_amount?: number | null
          last_refill_at?: string | null
          monitored_at?: string | null
          network: string
          total_gas_spent?: number | null
          transaction_count?: number | null
          wallet_address: string
        }
        Update: {
          alert_threshold?: number | null
          balance?: number
          created_at?: string | null
          estimated_transactions_remaining?: number | null
          gas_price_gwei?: number | null
          id?: string
          is_low?: boolean | null
          last_refill_amount?: number | null
          last_refill_at?: string | null
          monitored_at?: string | null
          network?: string
          total_gas_spent?: number | null
          transaction_count?: number | null
          wallet_address?: string
        }
        Relationships: []
      }
      health_goals: {
        Row: {
          carecoin_reward: number | null
          created_at: string | null
          current_value: string | null
          goal_description: string
          goal_type: string
          id: string
          milestones: Json | null
          patient_id: string | null
          progress_percentage: number | null
          status: string | null
          target_date: string | null
          target_value: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          carecoin_reward?: number | null
          created_at?: string | null
          current_value?: string | null
          goal_description: string
          goal_type: string
          id?: string
          milestones?: Json | null
          patient_id?: string | null
          progress_percentage?: number | null
          status?: string | null
          target_date?: string | null
          target_value?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          carecoin_reward?: number | null
          created_at?: string | null
          current_value?: string | null
          goal_description?: string
          goal_type?: string
          id?: string
          milestones?: Json | null
          patient_id?: string | null
          progress_percentage?: number | null
          status?: string | null
          target_date?: string | null
          target_value?: string | null
          updated_at?: string | null
          user_id?: string
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
      health_rewards: {
        Row: {
          carecoins_earned: number
          completion_date: string | null
          created_at: string | null
          goal_description: string | null
          id: string
          metadata: Json | null
          reward_name: string
          reward_type: string
          status: string | null
          user_id: string
          verified_by: string | null
        }
        Insert: {
          carecoins_earned: number
          completion_date?: string | null
          created_at?: string | null
          goal_description?: string | null
          id?: string
          metadata?: Json | null
          reward_name: string
          reward_type: string
          status?: string | null
          user_id: string
          verified_by?: string | null
        }
        Update: {
          carecoins_earned?: number
          completion_date?: string | null
          created_at?: string | null
          goal_description?: string | null
          id?: string
          metadata?: Json | null
          reward_name?: string
          reward_type?: string
          status?: string | null
          user_id?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      hl7_message_log: {
        Row: {
          created_at: string | null
          destination_system: string | null
          direction: string | null
          error_message: string | null
          id: string
          message_event: string
          message_id: string
          message_type: string
          parsed_data: Json | null
          patient_id: string | null
          processed_at: string | null
          processing_status: string | null
          raw_message: string
          source_system: string | null
        }
        Insert: {
          created_at?: string | null
          destination_system?: string | null
          direction?: string | null
          error_message?: string | null
          id?: string
          message_event: string
          message_id: string
          message_type: string
          parsed_data?: Json | null
          patient_id?: string | null
          processed_at?: string | null
          processing_status?: string | null
          raw_message: string
          source_system?: string | null
        }
        Update: {
          created_at?: string | null
          destination_system?: string | null
          direction?: string | null
          error_message?: string | null
          id?: string
          message_event?: string
          message_id?: string
          message_type?: string
          parsed_data?: Json | null
          patient_id?: string | null
          processed_at?: string | null
          processing_status?: string | null
          raw_message?: string
          source_system?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hl7_message_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      immunizations: {
        Row: {
          administered_by: string | null
          administration_date: string
          created_at: string | null
          dose: string | null
          expiration_date: string | null
          id: string
          lot_number: string | null
          notes: string | null
          patient_id: string
          route: string | null
          site: string | null
          updated_at: string | null
          vaccine_name: string
        }
        Insert: {
          administered_by?: string | null
          administration_date: string
          created_at?: string | null
          dose?: string | null
          expiration_date?: string | null
          id?: string
          lot_number?: string | null
          notes?: string | null
          patient_id: string
          route?: string | null
          site?: string | null
          updated_at?: string | null
          vaccine_name: string
        }
        Update: {
          administered_by?: string | null
          administration_date?: string
          created_at?: string | null
          dose?: string | null
          expiration_date?: string | null
          id?: string
          lot_number?: string | null
          notes?: string | null
          patient_id?: string
          route?: string | null
          site?: string | null
          updated_at?: string | null
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
      insurance_payments: {
        Row: {
          billed_amount: number
          carecoins_credited: number | null
          claim_number: string | null
          created_at: string | null
          id: string
          insurance_company: string
          notes: string | null
          paid_amount: number | null
          patient_id: string
          patient_responsibility: number | null
          payment_status: string | null
          policy_number: string
          service_date: string
          updated_at: string | null
        }
        Insert: {
          billed_amount: number
          carecoins_credited?: number | null
          claim_number?: string | null
          created_at?: string | null
          id?: string
          insurance_company: string
          notes?: string | null
          paid_amount?: number | null
          patient_id: string
          patient_responsibility?: number | null
          payment_status?: string | null
          policy_number: string
          service_date: string
          updated_at?: string | null
        }
        Update: {
          billed_amount?: number
          carecoins_credited?: number | null
          claim_number?: string | null
          created_at?: string | null
          id?: string
          insurance_company?: string
          notes?: string | null
          paid_amount?: number | null
          patient_id?: string
          patient_responsibility?: number | null
          payment_status?: string | null
          policy_number?: string
          service_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          address_verified: boolean | null
          created_at: string | null
          documents_submitted: Json | null
          expires_at: string | null
          id: string
          identity_verified: boolean | null
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          verification_id: string | null
          verification_provider: string | null
          verified_at: string | null
        }
        Insert: {
          address_verified?: boolean | null
          created_at?: string | null
          documents_submitted?: Json | null
          expires_at?: string | null
          id?: string
          identity_verified?: boolean | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          verification_id?: string | null
          verification_provider?: string | null
          verified_at?: string | null
        }
        Update: {
          address_verified?: boolean | null
          created_at?: string | null
          documents_submitted?: Json | null
          expires_at?: string | null
          id?: string
          identity_verified?: boolean | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          verification_id?: string | null
          verification_provider?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      lab_results: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          ordered_by: string | null
          patient_id: string
          performed_by: string | null
          reference_range: string | null
          result_value: string | null
          status: string | null
          test_date: string
          test_name: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          ordered_by?: string | null
          patient_id: string
          performed_by?: string | null
          reference_range?: string | null
          result_value?: string | null
          status?: string | null
          test_date: string
          test_name: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          ordered_by?: string | null
          patient_id?: string
          performed_by?: string | null
          reference_range?: string | null
          result_value?: string | null
          status?: string | null
          test_date?: string
          test_name?: string
          unit?: string | null
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
      legal_disclaimers: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          disclaimer_type: string
          display_location: string[] | null
          effective_date: string
          id: string
          is_active: boolean | null
          requires_acknowledgment: boolean | null
          title: string
          updated_at: string | null
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          disclaimer_type: string
          display_location?: string[] | null
          effective_date: string
          id?: string
          is_active?: boolean | null
          requires_acknowledgment?: boolean | null
          title: string
          updated_at?: string | null
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          disclaimer_type?: string
          display_location?: string[] | null
          effective_date?: string
          id?: string
          is_active?: boolean | null
          requires_acknowledgment?: boolean | null
          title?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      medical_diagnoses: {
        Row: {
          created_at: string | null
          diagnosed_by: string | null
          diagnosis_code: string
          diagnosis_name: string
          diagnosis_type: string | null
          id: string
          notes: string | null
          onset_date: string | null
          patient_id: string
          resolution_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          diagnosed_by?: string | null
          diagnosis_code: string
          diagnosis_name: string
          diagnosis_type?: string | null
          id?: string
          notes?: string | null
          onset_date?: string | null
          patient_id: string
          resolution_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          diagnosed_by?: string | null
          diagnosis_code?: string
          diagnosis_name?: string
          diagnosis_type?: string | null
          id?: string
          notes?: string | null
          onset_date?: string | null
          patient_id?: string
          resolution_date?: string | null
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
      medication_administration_log: {
        Row: {
          administered_at: string
          administered_by: string
          adverse_reaction: string | null
          created_at: string | null
          dose_given: string
          id: string
          medication_order_id: string
          notes: string | null
          patient_id: string
          patient_response: string | null
          reason_not_given: string | null
          route: string
          site: string | null
          status: string | null
        }
        Insert: {
          administered_at: string
          administered_by: string
          adverse_reaction?: string | null
          created_at?: string | null
          dose_given: string
          id?: string
          medication_order_id: string
          notes?: string | null
          patient_id: string
          patient_response?: string | null
          reason_not_given?: string | null
          route: string
          site?: string | null
          status?: string | null
        }
        Update: {
          administered_at?: string
          administered_by?: string
          adverse_reaction?: string | null
          created_at?: string | null
          dose_given?: string
          id?: string
          medication_order_id?: string
          notes?: string | null
          patient_id?: string
          patient_response?: string | null
          reason_not_given?: string | null
          route?: string
          site?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_administration_log_medication_order_id_fkey"
            columns: ["medication_order_id"]
            isOneToOne: false
            referencedRelation: "medication_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administration_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_interactions: {
        Row: {
          clinical_effects: string | null
          created_at: string | null
          description: string | null
          evidence_level: string | null
          id: string
          interaction_type: string
          management_strategy: string | null
          medication_a: string
          medication_b: string
          severity: string | null
          source: string | null
          updated_at: string | null
        }
        Insert: {
          clinical_effects?: string | null
          created_at?: string | null
          description?: string | null
          evidence_level?: string | null
          id?: string
          interaction_type: string
          management_strategy?: string | null
          medication_a: string
          medication_b: string
          severity?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          clinical_effects?: string | null
          created_at?: string | null
          description?: string | null
          evidence_level?: string | null
          id?: string
          interaction_type?: string
          management_strategy?: string | null
          medication_a?: string
          medication_b?: string
          severity?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      medication_orders: {
        Row: {
          created_at: string | null
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          medication_name: string
          notes: string | null
          patient_id: string
          prescribed_by: string | null
          route: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          medication_name: string
          notes?: string | null
          patient_id: string
          prescribed_by?: string | null
          route?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          medication_name?: string
          notes?: string | null
          patient_id?: string
          prescribed_by?: string | null
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
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          read_at: string | null
          recipient_id: string | null
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
        }
        Relationships: []
      }
      multisig_signatures: {
        Row: {
          id: string
          signature: string
          signed_at: string | null
          signed_by: string | null
          signer_address: string
          transaction_id: string
        }
        Insert: {
          id?: string
          signature: string
          signed_at?: string | null
          signed_by?: string | null
          signer_address: string
          transaction_id: string
        }
        Update: {
          id?: string
          signature?: string
          signed_at?: string | null
          signed_by?: string | null
          signer_address?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "multisig_signatures_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "multisig_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      multisig_signers: {
        Row: {
          added_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          signer_address: string
          signer_name: string | null
          wallet_address: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          signer_address: string
          signer_name?: string | null
          wallet_address: string
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          signer_address?: string
          signer_name?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      multisig_transactions: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          current_signatures: number | null
          data: Json | null
          executed_at: string | null
          expiry_date: string | null
          id: string
          required_signatures: number
          status: string | null
          to_address: string
          transaction_hash: string | null
          transaction_type: string
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          current_signatures?: number | null
          data?: Json | null
          executed_at?: string | null
          expiry_date?: string | null
          id?: string
          required_signatures?: number
          status?: string | null
          to_address: string
          transaction_hash?: string | null
          transaction_type: string
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          current_signatures?: number | null
          data?: Json | null
          executed_at?: string | null
          expiry_date?: string | null
          id?: string
          required_signatures?: number
          status?: string | null
          to_address?: string
          transaction_hash?: string | null
          transaction_type?: string
          wallet_address?: string
        }
        Relationships: []
      }
      patient_assignments: {
        Row: {
          assignment_type: string
          created_at: string | null
          created_by: string | null
          id: string
          is_primary: boolean | null
          notes: string | null
          patient_id: string
          shift_date: string
          shift_end: string
          shift_start: string
          staff_id: string
          updated_at: string | null
        }
        Insert: {
          assignment_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          patient_id: string
          shift_date: string
          shift_end: string
          shift_start: string
          staff_id: string
          updated_at?: string | null
        }
        Update: {
          assignment_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          patient_id?: string
          shift_date?: string
          shift_end?: string
          shift_start?: string
          staff_id?: string
          updated_at?: string | null
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
      patient_consents: {
        Row: {
          consent_date: string
          consent_document_url: string | null
          consent_given: boolean
          consent_type: string
          created_at: string | null
          expiration_date: string | null
          id: string
          notes: string | null
          patient_id: string
          revoked: boolean | null
          revoked_date: string | null
          updated_at: string | null
          witness_id: string | null
        }
        Insert: {
          consent_date: string
          consent_document_url?: string | null
          consent_given: boolean
          consent_type: string
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          revoked?: boolean | null
          revoked_date?: string | null
          updated_at?: string | null
          witness_id?: string | null
        }
        Update: {
          consent_date?: string
          consent_document_url?: string | null
          consent_given?: boolean
          consent_type?: string
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          revoked?: boolean | null
          revoked_date?: string | null
          updated_at?: string | null
          witness_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_consents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_notes: {
        Row: {
          assessment: string | null
          content: string | null
          created_at: string | null
          created_by: string
          id: string
          note_type: string | null
          objective: string | null
          patient_id: string
          plan: string | null
          subjective: string | null
          updated_at: string | null
        }
        Insert: {
          assessment?: string | null
          content?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          note_type?: string | null
          objective?: string | null
          patient_id: string
          plan?: string | null
          subjective?: string | null
          updated_at?: string | null
        }
        Update: {
          assessment?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          note_type?: string | null
          objective?: string | null
          patient_id?: string
          plan?: string | null
          subjective?: string | null
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
      patient_portal_users: {
        Row: {
          access_level: string | null
          activated_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          patient_id: string
          portal_user_id: string
          relationship: string | null
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          activated_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          patient_id: string
          portal_user_id: string
          relationship?: string | null
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          activated_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          patient_id?: string
          portal_user_id?: string
          relationship?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_portal_users_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_risk_scores: {
        Row: {
          calculated_at: string | null
          calculated_by: string | null
          confidence_score: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          model_version: string | null
          patient_id: string
          recommendations: string | null
          risk_factors: Json | null
          risk_level: string | null
          risk_score: number
          risk_type: string
        }
        Insert: {
          calculated_at?: string | null
          calculated_by?: string | null
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          model_version?: string | null
          patient_id: string
          recommendations?: string | null
          risk_factors?: Json | null
          risk_level?: string | null
          risk_score: number
          risk_type: string
        }
        Update: {
          calculated_at?: string | null
          calculated_by?: string | null
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          model_version?: string | null
          patient_id?: string
          recommendations?: string | null
          risk_factors?: Json | null
          risk_level?: string | null
          risk_score?: number
          risk_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_risk_scores_patient_id_fkey"
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
          patient_id: string
          recorded_at: string | null
          recorded_by: string | null
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
          patient_id: string
          recorded_at?: string | null
          recorded_by?: string | null
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
          patient_id?: string
          recorded_at?: string | null
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
          admission_date: string | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string
          discharge_activity: string | null
          discharge_condition: string | null
          discharge_date: string | null
          discharge_diet: string | null
          discharge_disposition: string | null
          discharge_follow_up: string | null
          discharge_instructions: string | null
          discharged_at: string | null
          discharged_by: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          facial_data: string | null
          first_name: string
          gender: string
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          last_name: string
          medical_record_number: string | null
          name: string | null
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
          date_of_birth: string
          discharge_activity?: string | null
          discharge_condition?: string | null
          discharge_date?: string | null
          discharge_diet?: string | null
          discharge_disposition?: string | null
          discharge_follow_up?: string | null
          discharge_instructions?: string | null
          discharged_at?: string | null
          discharged_by?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          facial_data?: string | null
          first_name: string
          gender: string
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name: string
          medical_record_number?: string | null
          name?: string | null
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
          date_of_birth?: string
          discharge_activity?: string | null
          discharge_condition?: string | null
          discharge_date?: string | null
          discharge_diet?: string | null
          discharge_disposition?: string | null
          discharge_follow_up?: string | null
          discharge_instructions?: string | null
          discharged_at?: string | null
          discharged_by?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          facial_data?: string | null
          first_name?: string
          gender?: string
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name?: string
          medical_record_number?: string | null
          name?: string | null
          phone?: string | null
          primary_physician?: string | null
          room_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      phi_access_logs: {
        Row: {
          access_type: string
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          is_emergency_access: boolean | null
          justification: string | null
          patient_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_type: string
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          is_emergency_access?: boolean | null
          justification?: string | null
          patient_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          is_emergency_access?: boolean | null
          justification?: string | null
          patient_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phi_access_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          assistant_ids: string[] | null
          complications: string | null
          created_at: string | null
          id: string
          outcome: string | null
          patient_id: string
          performed_at: string
          performed_by: string | null
          procedure_code: string | null
          procedure_name: string
          procedure_notes: string | null
          updated_at: string | null
        }
        Insert: {
          assistant_ids?: string[] | null
          complications?: string | null
          created_at?: string | null
          id?: string
          outcome?: string | null
          patient_id: string
          performed_at: string
          performed_by?: string | null
          procedure_code?: string | null
          procedure_name: string
          procedure_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          assistant_ids?: string[] | null
          complications?: string | null
          created_at?: string | null
          id?: string
          outcome?: string | null
          patient_id?: string
          performed_at?: string
          performed_by?: string | null
          procedure_code?: string | null
          procedure_name?: string
          procedure_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procedures_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          care_coins_balance: number | null
          created_at: string | null
          email: string
          id: string
          last_seen: string | null
          name: string | null
          online_status: boolean | null
          organization: string | null
          role: string | null
          specialty: string | null
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          care_coins_balance?: number | null
          created_at?: string | null
          email: string
          id: string
          last_seen?: string | null
          name?: string | null
          online_status?: boolean | null
          organization?: string | null
          role?: string | null
          specialty?: string | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          care_coins_balance?: number | null
          created_at?: string | null
          email?: string
          id?: string
          last_seen?: string | null
          name?: string | null
          online_status?: boolean | null
          organization?: string | null
          role?: string | null
          specialty?: string | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      provider_schedules: {
        Row: {
          appointment_duration_minutes: number | null
          created_at: string | null
          day_of_week: number | null
          effective_date: string | null
          end_time: string
          expiration_date: string | null
          id: string
          is_available: boolean | null
          location: string | null
          provider_id: string
          schedule_type: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          appointment_duration_minutes?: number | null
          created_at?: string | null
          day_of_week?: number | null
          effective_date?: string | null
          end_time: string
          expiration_date?: string | null
          id?: string
          is_available?: boolean | null
          location?: string | null
          provider_id: string
          schedule_type?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          appointment_duration_minutes?: number | null
          created_at?: string | null
          day_of_week?: number | null
          effective_date?: string | null
          end_time?: string
          expiration_date?: string | null
          id?: string
          is_available?: boolean | null
          location?: string | null
          provider_id?: string
          schedule_type?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_time_off: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          end_date: string
          id: string
          is_approved: boolean | null
          provider_id: string
          reason: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          is_approved?: boolean | null
          provider_id: string
          reason?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          is_approved?: boolean | null
          provider_id?: string
          reason?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      resource_reservations: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          end_time: string
          equipment_id: string | null
          facility_id: string | null
          id: string
          notes: string | null
          reserved_by: string
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          end_time: string
          equipment_id?: string | null
          facility_id?: string | null
          id?: string
          notes?: string | null
          reserved_by: string
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          end_time?: string
          equipment_id?: string | null
          facility_id?: string | null
          id?: string
          notes?: string | null
          reserved_by?: string
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_reservations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_reservations_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_reservations_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          accepted_at: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string | null
          distance_km: number | null
          driver_earnings: number | null
          driver_id: string | null
          driver_name: string | null
          driver_phone: string | null
          driver_rating: number | null
          dropoff_address: string
          dropoff_latitude: number
          dropoff_longitude: number
          duration_minutes: number | null
          estimated_cost: number
          final_cost: number | null
          id: string
          notes: string | null
          patient_id: string | null
          pickup_address: string
          pickup_at: string | null
          pickup_latitude: number
          pickup_longitude: number
          ride_type: string
          scheduled_for: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_earnings?: number | null
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_rating?: number | null
          dropoff_address: string
          dropoff_latitude: number
          dropoff_longitude: number
          duration_minutes?: number | null
          estimated_cost: number
          final_cost?: number | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          pickup_address: string
          pickup_at?: string | null
          pickup_latitude: number
          pickup_longitude: number
          ride_type: string
          scheduled_for?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_earnings?: number | null
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_rating?: number | null
          dropoff_address?: string
          dropoff_latitude?: number
          dropoff_longitude?: number
          duration_minutes?: number | null
          estimated_cost?: number
          final_cost?: number | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          pickup_address?: string
          pickup_at?: string | null
          pickup_latitude?: number
          pickup_longitude?: number
          ride_type?: string
          scheduled_for?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          closed_at: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          subject: string
          tags: string[] | null
          ticket_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          subject: string
          tags?: string[] | null
          ticket_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          subject?: string
          tags?: string[] | null
          ticket_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tax_reporting: {
        Row: {
          created_at: string | null
          generated_at: string | null
          id: string
          report_type: string | null
          report_url: string | null
          sent_at: string | null
          sent_to_user: boolean | null
          tax_year: number
          total_carecoins_earned: number
          total_usd_value: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          report_type?: string | null
          report_url?: string | null
          sent_at?: string | null
          sent_to_user?: boolean | null
          tax_year: number
          total_carecoins_earned: number
          total_usd_value: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          report_type?: string | null
          report_url?: string | null
          sent_at?: string | null
          sent_to_user?: boolean | null
          tax_year?: number
          total_carecoins_earned?: number
          total_usd_value?: number
          user_id?: string
        }
        Relationships: []
      }
      terms_acceptances: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          terms_type: string
          terms_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          terms_type: string
          terms_version: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          terms_type?: string
          terms_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transaction_alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: string
          created_at: string | null
          id: string
          is_acknowledged: boolean | null
          message: string
          metadata: Json | null
          severity: string | null
          title: string
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: string
          created_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message: string
          metadata?: Json | null
          severity?: string | null
          title: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: string
          created_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message?: string
          metadata?: Json | null
          severity?: string | null
          title?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          created_at: string | null
          device_fingerprint: string
          device_name: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          is_trusted: boolean | null
          last_used_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_trusted?: boolean | null
          last_used_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_trusted?: boolean | null
          last_used_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          description: string
          feedback_type: string | null
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          feedback_type?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          feedback_type?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_mfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          last_used_at: string | null
          mfa_enabled: boolean | null
          mfa_method: string | null
          phone_number: string | null
          totp_secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          phone_number?: string | null
          totp_secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          phone_number?: string | null
          totp_secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          completed_at: string | null
          completed_steps: string[] | null
          created_at: string | null
          current_step: number | null
          id: string
          is_completed: boolean | null
          onboarding_step: string
          progress_data: Json | null
          skipped: boolean | null
          total_steps: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          onboarding_step: string
          progress_data?: Json | null
          skipped?: boolean | null
          total_steps?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          onboarding_step?: string
          progress_data?: Json | null
          skipped?: boolean | null
          total_steps?: number | null
          updated_at?: string | null
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
      user_sessions: {
        Row: {
          created_at: string | null
          device_id: string | null
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity_at: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      video_sessions: {
        Row: {
          appointment_id: string | null
          connection_quality: string | null
          created_at: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          patient_id: string | null
          peer_id: string | null
          provider_id: string
          recording_consent: boolean | null
          recording_url: string | null
          session_id: string
          session_notes: string | null
          session_type: string | null
          started_at: string | null
          status: string | null
          technical_issues: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          connection_quality?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          patient_id?: string | null
          peer_id?: string | null
          provider_id: string
          recording_consent?: boolean | null
          recording_url?: string | null
          session_id: string
          session_notes?: string | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          technical_issues?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          connection_quality?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          patient_id?: string | null
          peer_id?: string | null
          provider_id?: string
          recording_consent?: boolean | null
          recording_url?: string | null
          session_id?: string
          session_notes?: string | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          technical_issues?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      wound_assessments: {
        Row: {
          assessed_by: string | null
          assessment_date: string | null
          created_at: string | null
          depth_cm: number | null
          drainage_amount: string | null
          drainage_type: string | null
          id: string
          image_url: string | null
          length_cm: number | null
          pain_level: number | null
          patient_id: string
          periwound_condition: string | null
          treatment_plan: string | null
          updated_at: string | null
          width_cm: number | null
          wound_bed_appearance: string | null
          wound_location: string
          wound_type: string | null
        }
        Insert: {
          assessed_by?: string | null
          assessment_date?: string | null
          created_at?: string | null
          depth_cm?: number | null
          drainage_amount?: string | null
          drainage_type?: string | null
          id?: string
          image_url?: string | null
          length_cm?: number | null
          pain_level?: number | null
          patient_id: string
          periwound_condition?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
          width_cm?: number | null
          wound_bed_appearance?: string | null
          wound_location: string
          wound_type?: string | null
        }
        Update: {
          assessed_by?: string | null
          assessment_date?: string | null
          created_at?: string | null
          depth_cm?: number | null
          drainage_amount?: string | null
          drainage_type?: string | null
          id?: string
          image_url?: string | null
          length_cm?: number | null
          pain_level?: number | null
          patient_id?: string
          periwound_condition?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
          width_cm?: number | null
          wound_bed_appearance?: string | null
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
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      check_carecoin_rate_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      generate_ticket_number: { Args: never; Returns: string }
      get_user_role: { Args: { user_id: string }; Returns: string }
      has_any_role:
        | { Args: { role_names: string[]; user_id: string }; Returns: boolean }
        | {
            Args: {
              _roles: Database["public"]["Enums"]["app_role"][]
              _user_id: string
            }
            Returns: boolean
          }
      has_role:
        | { Args: { role_name: string; user_id: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      increment_balance: {
        Args: { p_amount: number; p_user_id: string }
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
        | "social_worker"
        | "phlebotomist"
        | "pharmacist"
        | "receptionist"
        | "billing"
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
        "social_worker",
        "phlebotomist",
        "pharmacist",
        "receptionist",
        "billing",
      ],
    },
  },
} as const
