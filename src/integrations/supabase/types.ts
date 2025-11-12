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
      capacity_metrics: {
        Row: {
          available_beds: number
          created_at: string | null
          er_patients_waiting: number | null
          forecasted_admissions: number | null
          forecasted_discharges: number | null
          id: string
          metric_date: string
          metric_hour: number | null
          occupied_beds: number
          pending_admissions: number | null
          pending_discharges: number | null
          total_beds: number
        }
        Insert: {
          available_beds: number
          created_at?: string | null
          er_patients_waiting?: number | null
          forecasted_admissions?: number | null
          forecasted_discharges?: number | null
          id?: string
          metric_date: string
          metric_hour?: number | null
          occupied_beds: number
          pending_admissions?: number | null
          pending_discharges?: number | null
          total_beds: number
        }
        Update: {
          available_beds?: number
          created_at?: string | null
          er_patients_waiting?: number | null
          forecasted_admissions?: number | null
          forecasted_discharges?: number | null
          id?: string
          metric_date?: string
          metric_hour?: number | null
          occupied_beds?: number
          pending_admissions?: number | null
          pending_discharges?: number | null
          total_beds?: number
        }
        Relationships: []
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
      care_tasks: {
        Row: {
          assigned_by: string
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          mentions: Json | null
          patient_id: string | null
          priority: string | null
          status: string | null
          task_description: string | null
          task_title: string
          updated_at: string | null
        }
        Insert: {
          assigned_by: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          mentions?: Json | null
          patient_id?: string | null
          priority?: string | null
          status?: string | null
          task_description?: string | null
          task_title: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          mentions?: Json | null
          patient_id?: string | null
          priority?: string | null
          status?: string | null
          task_description?: string | null
          task_title?: string
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
          created_at: string | null
          end_date: string | null
          id: string
          is_primary: boolean | null
          notes: string | null
          patient_id: string | null
          role: string
          start_date: string
          team_member_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          patient_id?: string | null
          role: string
          start_date: string
          team_member_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          patient_id?: string | null
          role?: string
          start_date?: string
          team_member_id?: string
          updated_at?: string | null
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
      carecoin_merchants: {
        Row: {
          accepts_carecoins: boolean | null
          active: boolean | null
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          discount_percentage: number | null
          id: string
          merchant_name: string
          merchant_type: string | null
          merchant_wallet_address: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          accepts_carecoins?: boolean | null
          active?: boolean | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          merchant_name: string
          merchant_type?: string | null
          merchant_wallet_address?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          accepts_carecoins?: boolean | null
          active?: boolean | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          merchant_name?: string
          merchant_type?: string | null
          merchant_wallet_address?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      carecoin_staking: {
        Row: {
          apy_rate: number
          created_at: string | null
          early_withdrawal_penalty: number | null
          id: string
          rewards_earned: number | null
          stake_end_date: string
          stake_start_date: string
          staked_amount: number
          staking_period_days: number
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          apy_rate: number
          created_at?: string | null
          early_withdrawal_penalty?: number | null
          id?: string
          rewards_earned?: number | null
          stake_end_date: string
          stake_start_date: string
          staked_amount: number
          staking_period_days: number
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          apy_rate?: number
          created_at?: string | null
          early_withdrawal_penalty?: number | null
          id?: string
          rewards_earned?: number | null
          stake_end_date?: string
          stake_start_date?: string
          staked_amount?: number
          staking_period_days?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cashout_requests: {
        Row: {
          account_info: Json
          amount: number
          completed_at: string | null
          created_at: string
          exchange_rate: number
          failure_reason: string | null
          id: string
          payment_method: string
          processed_at: string | null
          requested_at: string
          status: string
          transaction_hash: string | null
          updated_at: string
          usd_amount: number
          user_id: string
        }
        Insert: {
          account_info: Json
          amount: number
          completed_at?: string | null
          created_at?: string
          exchange_rate: number
          failure_reason?: string | null
          id?: string
          payment_method: string
          processed_at?: string | null
          requested_at?: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          usd_amount: number
          user_id: string
        }
        Update: {
          account_info?: Json
          amount?: number
          completed_at?: string | null
          created_at?: string
          exchange_rate?: number
          failure_reason?: string | null
          id?: string
          payment_method?: string
          processed_at?: string | null
          requested_at?: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          usd_amount?: number
          user_id?: string
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
      clinical_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_message: string
          alert_type: string
          created_at: string | null
          id: string
          patient_id: string | null
          resolved: boolean | null
          resolved_at: string | null
          severity: string
          triggered_by: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_message: string
          alert_type: string
          created_at?: string | null
          id?: string
          patient_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity: string
          triggered_by?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_message?: string
          alert_type?: string
          created_at?: string | null
          id?: string
          patient_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          triggered_by?: string | null
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
          condition: string
          created_at: string | null
          effective_date: string | null
          evidence_level: string | null
          guideline_content: string
          guideline_title: string
          id: string
          source: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          condition: string
          created_at?: string | null
          effective_date?: string | null
          evidence_level?: string | null
          guideline_content: string
          guideline_title: string
          id?: string
          source?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          condition?: string
          created_at?: string | null
          effective_date?: string | null
          evidence_level?: string | null
          guideline_content?: string
          guideline_title?: string
          id?: string
          source?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          consultant_name: string | null
          consultation_date: string
          created_at: string | null
          findings: string | null
          id: string
          patient_id: string
          recommendations: string | null
          requested_by: string | null
          specialty: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          consultant_name?: string | null
          consultation_date: string
          created_at?: string | null
          findings?: string | null
          id?: string
          patient_id: string
          recommendations?: string | null
          requested_by?: string | null
          specialty: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          consultant_name?: string | null
          consultation_date?: string
          created_at?: string | null
          findings?: string | null
          id?: string
          patient_id?: string
          recommendations?: string | null
          requested_by?: string | null
          specialty?: string
          status?: string | null
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
      data_retention_policies: {
        Row: {
          active: boolean | null
          archive_after_days: number | null
          created_at: string | null
          data_type: string
          delete_after_days: number | null
          id: string
          policy_description: string | null
          retention_period_days: number
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          archive_after_days?: number | null
          created_at?: string | null
          data_type: string
          delete_after_days?: number | null
          id?: string
          policy_description?: string | null
          retention_period_days: number
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          archive_after_days?: number | null
          created_at?: string | null
          data_type?: string
          delete_after_days?: number | null
          id?: string
          policy_description?: string | null
          retention_period_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      discharge_plans: {
        Row: {
          created_at: string | null
          created_by: string
          discharge_date: string | null
          discharge_destination: string | null
          discharge_instructions: string | null
          dme_ordered: boolean | null
          follow_up_appointments: Json | null
          follow_up_scheduled: boolean | null
          home_health_arranged: boolean | null
          id: string
          medications_reconciled: boolean | null
          patient_education_completed: boolean | null
          patient_id: string | null
          plan_status: string | null
          transportation_arranged: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          discharge_date?: string | null
          discharge_destination?: string | null
          discharge_instructions?: string | null
          dme_ordered?: boolean | null
          follow_up_appointments?: Json | null
          follow_up_scheduled?: boolean | null
          home_health_arranged?: boolean | null
          id?: string
          medications_reconciled?: boolean | null
          patient_education_completed?: boolean | null
          patient_id?: string | null
          plan_status?: string | null
          transportation_arranged?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          discharge_date?: string | null
          discharge_destination?: string | null
          discharge_instructions?: string | null
          dme_ordered?: boolean | null
          follow_up_appointments?: Json | null
          follow_up_scheduled?: boolean | null
          home_health_arranged?: boolean | null
          id?: string
          medications_reconciled?: boolean | null
          patient_education_completed?: boolean | null
          patient_id?: string | null
          plan_status?: string | null
          transportation_arranged?: boolean | null
          updated_at?: string | null
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
          generated_by: string
          id: string
          patient_id: string
          pdf_url: string | null
          summary_data: Json
        }
        Insert: {
          created_at?: string | null
          generated_by: string
          id?: string
          patient_id: string
          pdf_url?: string | null
          summary_data: Json
        }
        Update: {
          created_at?: string | null
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
            referencedRelation: "driver_performance"
            referencedColumns: ["id"]
          },
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
          average_rating: number | null
          care_coins_balance: number | null
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          id: string
          is_verified: boolean | null
          license_number: string
          license_plate: string | null
          location_updated_at: string | null
          rating: number | null
          status: string
          total_earnings: number | null
          total_ratings: number | null
          total_rides: number | null
          updated_at: string | null
          user_id: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_type: string
          vehicle_year: number | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          average_rating?: number | null
          care_coins_balance?: number | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_verified?: boolean | null
          license_number: string
          license_plate?: string | null
          location_updated_at?: string | null
          rating?: number | null
          status?: string
          total_earnings?: number | null
          total_ratings?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_type?: string
          vehicle_year?: number | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          average_rating?: number | null
          care_coins_balance?: number | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_verified?: boolean | null
          license_number?: string
          license_plate?: string | null
          location_updated_at?: string | null
          rating?: number | null
          status?: string
          total_earnings?: number | null
          total_ratings?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_type?: string
          vehicle_year?: number | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
      external_lab_orders: {
        Row: {
          collection_date: string | null
          created_at: string | null
          id: string
          lab_system: string
          order_number: string
          ordered_at: string
          ordered_by: string | null
          patient_id: string | null
          received_at: string | null
          result_data: Json | null
          result_status: string | null
          test_name: string
        }
        Insert: {
          collection_date?: string | null
          created_at?: string | null
          id?: string
          lab_system: string
          order_number: string
          ordered_at: string
          ordered_by?: string | null
          patient_id?: string | null
          received_at?: string | null
          result_data?: Json | null
          result_status?: string | null
          test_name: string
        }
        Update: {
          collection_date?: string | null
          created_at?: string | null
          id?: string
          lab_system?: string
          order_number?: string
          ordered_at?: string
          ordered_by?: string | null
          patient_id?: string | null
          received_at?: string | null
          result_data?: Json | null
          result_status?: string | null
          test_name?: string
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
          id: string
          internal_id: string
          internal_type: string
          last_synced_at: string | null
          mapping_metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          external_id: string
          external_system: string
          id?: string
          internal_id: string
          internal_type: string
          last_synced_at?: string | null
          mapping_metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          external_id?: string
          external_system?: string
          id?: string
          internal_id?: string
          internal_type?: string
          last_synced_at?: string | null
          mapping_metadata?: Json | null
        }
        Relationships: []
      }
      facial_data_history: {
        Row: {
          confidence: number | null
          facial_data: string
          id: string
          is_active: boolean
          notes: string | null
          patient_id: string
          registered_at: string
          registered_by: string | null
        }
        Insert: {
          confidence?: number | null
          facial_data: string
          id?: string
          is_active?: boolean
          notes?: string | null
          patient_id: string
          registered_at?: string
          registered_by?: string | null
        }
        Update: {
          confidence?: number | null
          facial_data?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          patient_id?: string
          registered_at?: string
          registered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facial_data_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_locations: {
        Row: {
          address: string
          created_at: string | null
          id: string
          latitude: number
          location_type: string
          longitude: number
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          latitude: number
          location_type?: string
          longitude: number
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          latitude?: number
          location_type?: string
          longitude?: number
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      group_conversations: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      group_message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "group_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          group_id: string
          id: string
          is_pinned: boolean | null
          pinned_at: string | null
          pinned_by: string | null
          sender_id: string
          voice_duration: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          group_id: string
          id?: string
          is_pinned?: boolean | null
          pinned_at?: string | null
          pinned_by?: string | null
          sender_id: string
          voice_duration?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          group_id?: string
          id?: string
          is_pinned?: boolean | null
          pinned_at?: string | null
          pinned_by?: string | null
          sender_id?: string
          voice_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      group_participants: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_participants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_conversations"
            referencedColumns: ["id"]
          },
        ]
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
      health_rewards: {
        Row: {
          activity_date: string
          activity_details: Json | null
          awarded_at: string | null
          coins_awarded: number
          id: string
          patient_id: string | null
          reward_amount: number
          reward_type: string
          user_id: string
        }
        Insert: {
          activity_date: string
          activity_details?: Json | null
          awarded_at?: string | null
          coins_awarded: number
          id?: string
          patient_id?: string | null
          reward_amount: number
          reward_type: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_details?: Json | null
          awarded_at?: string | null
          coins_awarded?: number
          id?: string
          patient_id?: string | null
          reward_amount?: number
          reward_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_rewards_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      hl7_message_log: {
        Row: {
          created_at: string | null
          destination_system: string | null
          error_message: string | null
          id: string
          message_content: string | null
          message_direction: string | null
          message_id: string | null
          message_type: string
          patient_id: string | null
          processed_at: string | null
          source_system: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          destination_system?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          message_direction?: string | null
          message_id?: string | null
          message_type: string
          patient_id?: string | null
          processed_at?: string | null
          source_system?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          destination_system?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          message_direction?: string | null
          message_id?: string | null
          message_type?: string
          patient_id?: string | null
          processed_at?: string | null
          source_system?: string | null
          status?: string | null
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
      insurance_payments: {
        Row: {
          carecoins_converted: number | null
          claim_number: string | null
          conversion_rate: number | null
          created_at: string | null
          id: string
          insurance_provider: string
          patient_id: string | null
          payment_amount: number
          payment_date: string
          payment_type: string | null
        }
        Insert: {
          carecoins_converted?: number | null
          claim_number?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          insurance_provider: string
          patient_id?: string | null
          payment_amount: number
          payment_date: string
          payment_type?: string | null
        }
        Update: {
          carecoins_converted?: number | null
          claim_number?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          insurance_provider?: string
          patient_id?: string | null
          payment_amount?: number
          payment_date?: string
          payment_type?: string | null
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
      medication_administration_log: {
        Row: {
          administered_at: string
          administered_by: string
          created_at: string | null
          dose_given: string
          id: string
          medication_order_id: string | null
          notes: string | null
          patient_id: string | null
          patient_response: string | null
          reason_not_given: string | null
          route: string | null
          site: string | null
        }
        Insert: {
          administered_at: string
          administered_by: string
          created_at?: string | null
          dose_given: string
          id?: string
          medication_order_id?: string | null
          notes?: string | null
          patient_id?: string | null
          patient_response?: string | null
          reason_not_given?: string | null
          route?: string | null
          site?: string | null
        }
        Update: {
          administered_at?: string
          administered_by?: string
          created_at?: string | null
          dose_given?: string
          id?: string
          medication_order_id?: string | null
          notes?: string | null
          patient_id?: string | null
          patient_response?: string | null
          reason_not_given?: string | null
          route?: string | null
          site?: string | null
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
      medication_administration_records: {
        Row: {
          administered_at: string
          administered_by: string
          created_at: string | null
          dosage: string
          id: string
          medication_name: string
          medication_order_id: string
          notes: string | null
          patient_id: string
          reason: string | null
          route: string | null
          scheduled_time: string | null
          site: string | null
          status: string | null
          witness_id: string | null
        }
        Insert: {
          administered_at: string
          administered_by: string
          created_at?: string | null
          dosage: string
          id?: string
          medication_name: string
          medication_order_id: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          route?: string | null
          scheduled_time?: string | null
          site?: string | null
          status?: string | null
          witness_id?: string | null
        }
        Update: {
          administered_at?: string
          administered_by?: string
          created_at?: string | null
          dosage?: string
          id?: string
          medication_name?: string
          medication_order_id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          route?: string | null
          scheduled_time?: string | null
          site?: string | null
          status?: string | null
          witness_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_administration_records_medication_order_id_fkey"
            columns: ["medication_order_id"]
            isOneToOne: false
            referencedRelation: "medication_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administration_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_interactions: {
        Row: {
          clinical_guidance: string | null
          created_at: string | null
          id: string
          interaction_description: string
          interaction_severity: string
          medication_1: string
          medication_2: string
          updated_at: string | null
        }
        Insert: {
          clinical_guidance?: string | null
          created_at?: string | null
          id?: string
          interaction_description: string
          interaction_severity: string
          medication_1: string
          medication_2: string
          updated_at?: string | null
        }
        Update: {
          clinical_guidance?: string | null
          created_at?: string | null
          id?: string
          interaction_description?: string
          interaction_severity?: string
          medication_1?: string
          medication_2?: string
          updated_at?: string | null
        }
        Relationships: []
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
      message_reactions: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_shared: boolean | null
          title: string
          updated_at: string | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_shared?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_shared?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          author: string | null
          content: string
          conversation_id: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_read: boolean | null
          original_content: string | null
          platform: string | null
          recipient_id: string
          sender_id: string
          user_id: string | null
          voice_duration: number | null
        }
        Insert: {
          author?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          original_content?: string | null
          platform?: string | null
          recipient_id: string
          sender_id: string
          user_id?: string | null
          voice_duration?: number | null
        }
        Update: {
          author?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          original_content?: string | null
          platform?: string | null
          recipient_id?: string
          sender_id?: string
          user_id?: string | null
          voice_duration?: number | null
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
      notification_preferences: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          group_id: string | null
          id: string
          is_muted: boolean | null
          muted_until: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_muted?: boolean | null
          muted_until?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_muted?: boolean | null
          muted_until?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_conversations"
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
      patient_consents: {
        Row: {
          consent_date: string
          consent_document_url: string | null
          consent_status: string
          consent_type: string
          created_at: string | null
          expiration_date: string | null
          granted_to: string[] | null
          id: string
          notes: string | null
          patient_id: string | null
          scope: string | null
          updated_at: string | null
          witnessed_by: string | null
        }
        Insert: {
          consent_date: string
          consent_document_url?: string | null
          consent_status: string
          consent_type: string
          created_at?: string | null
          expiration_date?: string | null
          granted_to?: string[] | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          scope?: string | null
          updated_at?: string | null
          witnessed_by?: string | null
        }
        Update: {
          consent_date?: string
          consent_document_url?: string | null
          consent_status?: string
          consent_type?: string
          created_at?: string | null
          expiration_date?: string | null
          granted_to?: string[] | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          scope?: string | null
          updated_at?: string | null
          witnessed_by?: string | null
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
      patient_portal_users: {
        Row: {
          access_level: string | null
          active: boolean | null
          created_at: string | null
          id: string
          patient_id: string | null
          permissions: Json | null
          proxy_authorization_document_url: string | null
          relationship: string | null
          updated_at: string | null
          user_id: string
          verification_date: string | null
          verified: boolean | null
        }
        Insert: {
          access_level?: string | null
          active?: boolean | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          permissions?: Json | null
          proxy_authorization_document_url?: string | null
          relationship?: string | null
          updated_at?: string | null
          user_id: string
          verification_date?: string | null
          verified?: boolean | null
        }
        Update: {
          access_level?: string | null
          active?: boolean | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          permissions?: Json | null
          proxy_authorization_document_url?: string | null
          relationship?: string | null
          updated_at?: string | null
          user_id?: string
          verification_date?: string | null
          verified?: boolean | null
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
          contributing_factors: Json | null
          created_at: string | null
          id: string
          model_version: string | null
          patient_id: string | null
          risk_level: string
          risk_score: number
          risk_type: string
          valid_until: string | null
        }
        Insert: {
          calculated_at?: string | null
          contributing_factors?: Json | null
          created_at?: string | null
          id?: string
          model_version?: string | null
          patient_id?: string | null
          risk_level: string
          risk_score: number
          risk_type: string
          valid_until?: string | null
        }
        Update: {
          calculated_at?: string | null
          contributing_factors?: Json | null
          created_at?: string | null
          id?: string
          model_version?: string | null
          patient_id?: string | null
          risk_level?: string
          risk_score?: number
          risk_type?: string
          valid_until?: string | null
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
          gender: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          last_name: string
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
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name?: string
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
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name?: string
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
      pharmacy_analysis_history: {
        Row: {
          adherence_issues: number
          analysis_date: string
          created_at: string
          emails_sent: number
          id: string
          insights_data: Json | null
          refill_predictions: number
          run_type: string
          safety_alerts: number
          total_insights: number
          triggered_by: string | null
        }
        Insert: {
          adherence_issues?: number
          analysis_date?: string
          created_at?: string
          emails_sent?: number
          id?: string
          insights_data?: Json | null
          refill_predictions?: number
          run_type?: string
          safety_alerts?: number
          total_insights?: number
          triggered_by?: string | null
        }
        Update: {
          adherence_issues?: number
          analysis_date?: string
          created_at?: string
          emails_sent?: number
          id?: string
          insights_data?: Json | null
          refill_predictions?: number
          run_type?: string
          safety_alerts?: number
          total_insights?: number
          triggered_by?: string | null
        }
        Relationships: []
      }
      pharmacy_analytics: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          medication_name: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          patient_id: string | null
          projection_date: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          medication_name: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          patient_id?: string | null
          projection_date?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          medication_name?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          patient_id?: string | null
          projection_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_analytics_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_inventory: {
        Row: {
          cost_per_unit: number | null
          created_at: string | null
          expiration_date: string | null
          id: string
          last_restocked_at: string | null
          location: string | null
          lot_number: string | null
          medication_name: string
          ndc_code: string | null
          quantity: number
          reorder_quantity: number
          reorder_threshold: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          last_restocked_at?: string | null
          location?: string | null
          lot_number?: string | null
          medication_name: string
          ndc_code?: string | null
          quantity?: number
          reorder_quantity?: number
          reorder_threshold?: number
          unit?: string
          updated_at?: string | null
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          last_restocked_at?: string | null
          location?: string | null
          lot_number?: string | null
          medication_name?: string
          ndc_code?: string | null
          quantity?: number
          reorder_quantity?: number
          reorder_threshold?: number
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pharmacy_notification_preferences: {
        Row: {
          adherence_alerts_enabled: boolean
          cost_savings_alerts_enabled: boolean
          created_at: string
          daily_summary_enabled: boolean
          email_enabled: boolean
          id: string
          inventory_alerts_enabled: boolean
          refill_alerts_enabled: boolean
          refill_alerts_min_urgency: string
          safety_alerts_enabled: boolean
          safety_alerts_min_priority: string
          updated_at: string
          user_id: string
        }
        Insert: {
          adherence_alerts_enabled?: boolean
          cost_savings_alerts_enabled?: boolean
          created_at?: string
          daily_summary_enabled?: boolean
          email_enabled?: boolean
          id?: string
          inventory_alerts_enabled?: boolean
          refill_alerts_enabled?: boolean
          refill_alerts_min_urgency?: string
          safety_alerts_enabled?: boolean
          safety_alerts_min_priority?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          adherence_alerts_enabled?: boolean
          cost_savings_alerts_enabled?: boolean
          created_at?: string
          daily_summary_enabled?: boolean
          email_enabled?: boolean
          id?: string
          inventory_alerts_enabled?: boolean
          refill_alerts_enabled?: boolean
          refill_alerts_min_urgency?: string
          safety_alerts_enabled?: boolean
          safety_alerts_min_priority?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      phi_access_logs: {
        Row: {
          access_reason: string | null
          access_type: string
          accessed_at: string | null
          emergency_access: boolean | null
          id: string
          ip_address: string | null
          patient_id: string | null
          phi_fields_accessed: string[] | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_reason?: string | null
          access_type: string
          accessed_at?: string | null
          emergency_access?: boolean | null
          id?: string
          ip_address?: string | null
          patient_id?: string | null
          phi_fields_accessed?: string[] | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_reason?: string | null
          access_type?: string
          accessed_at?: string | null
          emergency_access?: boolean | null
          id?: string
          ip_address?: string | null
          patient_id?: string | null
          phi_fields_accessed?: string[] | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
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
      prescription_deliveries: {
        Row: {
          actual_delivery_time: string | null
          assigned_to: string | null
          created_at: string | null
          delivered_by: string | null
          delivery_method: string | null
          id: string
          notes: string | null
          patient_id: string
          prescription_fill_id: string
          room_number: string | null
          scheduled_delivery_time: string | null
          signature_obtained: boolean | null
          signature_required: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          assigned_to?: string | null
          created_at?: string | null
          delivered_by?: string | null
          delivery_method?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          prescription_fill_id: string
          room_number?: string | null
          scheduled_delivery_time?: string | null
          signature_obtained?: boolean | null
          signature_required?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          assigned_to?: string | null
          created_at?: string | null
          delivered_by?: string | null
          delivery_method?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          prescription_fill_id?: string
          room_number?: string | null
          scheduled_delivery_time?: string | null
          signature_obtained?: boolean | null
          signature_required?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_deliveries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_deliveries_prescription_fill_id_fkey"
            columns: ["prescription_fill_id"]
            isOneToOne: false
            referencedRelation: "prescription_fills"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_fills: {
        Row: {
          created_at: string | null
          filled_at: string | null
          filled_by: string | null
          id: string
          inventory_id: string | null
          medication_name: string
          medication_order_id: string | null
          notes: string | null
          patient_id: string
          quantity_filled: number
          status: string | null
        }
        Insert: {
          created_at?: string | null
          filled_at?: string | null
          filled_by?: string | null
          id?: string
          inventory_id?: string | null
          medication_name: string
          medication_order_id?: string | null
          notes?: string | null
          patient_id: string
          quantity_filled: number
          status?: string | null
        }
        Update: {
          created_at?: string | null
          filled_at?: string | null
          filled_by?: string | null
          id?: string
          inventory_id?: string | null
          medication_name?: string
          medication_order_id?: string | null
          notes?: string | null
          patient_id?: string
          quantity_filled?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_fills_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_fills_medication_order_id_fkey"
            columns: ["medication_order_id"]
            isOneToOne: false
            referencedRelation: "medication_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_fills_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          patient_id: string
          performed_by: string | null
          procedure_date: string
          procedure_name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          performed_by?: string | null
          procedure_date: string
          procedure_name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          performed_by?: string | null
          procedure_date?: string
          procedure_name?: string
          status?: string | null
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
          email: string | null
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
          email?: string | null
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
          email?: string | null
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
      rides: {
        Row: {
          actual_dropoff_time: string | null
          actual_pickup_time: string | null
          created_at: string | null
          distance_km: number | null
          driver_earnings: number | null
          driver_id: string | null
          driver_name: string | null
          driver_phone: string | null
          driver_rating: number | null
          dropoff_latitude: number | null
          dropoff_location: string
          dropoff_longitude: number | null
          estimated_arrival: string | null
          estimated_arrival_time: string | null
          estimated_cost_carecoins: number | null
          id: string
          patient_id: string | null
          pickup_latitude: number | null
          pickup_location: string
          pickup_longitude: number | null
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
          distance_km?: number | null
          driver_earnings?: number | null
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_rating?: number | null
          dropoff_latitude?: number | null
          dropoff_location: string
          dropoff_longitude?: number | null
          estimated_arrival?: string | null
          estimated_arrival_time?: string | null
          estimated_cost_carecoins?: number | null
          id?: string
          patient_id?: string | null
          pickup_latitude?: number | null
          pickup_location: string
          pickup_longitude?: number | null
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
          distance_km?: number | null
          driver_earnings?: number | null
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_rating?: number | null
          dropoff_latitude?: number | null
          dropoff_location?: string
          dropoff_longitude?: number | null
          estimated_arrival?: string | null
          estimated_arrival_time?: string | null
          estimated_cost_carecoins?: number | null
          id?: string
          patient_id?: string | null
          pickup_latitude?: number | null
          pickup_location?: string
          pickup_longitude?: number | null
          ride_type?: string | null
          scheduled_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          vehicle_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_performance"
            referencedColumns: ["id"]
          },
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
      user_devices: {
        Row: {
          browser: string | null
          created_at: string | null
          device_fingerprint: string
          device_name: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          last_seen_at: string | null
          os: string | null
          trusted: boolean | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          last_seen_at?: string | null
          os?: string | null
          trusted?: boolean | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          last_seen_at?: string | null
          os?: string | null
          trusted?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_mfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          last_mfa_at: string | null
          mfa_enabled: boolean | null
          mfa_method: string | null
          phone_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          last_mfa_at?: string | null
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          phone_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          last_mfa_at?: string | null
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_sessions: {
        Row: {
          created_at: string | null
          device_id: string | null
          expires_at: string
          id: string
          ip_address: string | null
          revoked: boolean | null
          revoked_at: string | null
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
          revoked?: boolean | null
          revoked_at?: string | null
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
          revoked?: boolean | null
          revoked_at?: string | null
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
      driver_performance: {
        Row: {
          average_rating: number | null
          avg_earnings_per_ride: number | null
          cancelled_rides: number | null
          care_coins_balance: number | null
          completed_rides: number | null
          created_at: string | null
          driver_email: string | null
          driver_name: string | null
          id: string | null
          is_verified: boolean | null
          last_ride_date: string | null
          license_plate: string | null
          status: string | null
          total_earnings: number | null
          total_ratings: number | null
          total_rides: number | null
          user_id: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_type: string | null
          verification_status: string | null
        }
        Relationships: []
      }
      patient_audit_trail: {
        Row: {
          action_details: Json | null
          created_at: string | null
          event_type: string | null
          id: string | null
          patient_id: string | null
          patient_name: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
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
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
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
        | "social_worker"
        | "phlebotomist"
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
        "pharmacist",
        "patient",
        "social_worker",
        "phlebotomist",
        "receptionist",
        "billing",
      ],
    },
  },
} as const
