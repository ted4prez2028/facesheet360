export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      active_calls: {
        Row: {
          call_status: string
          caller_id: string
          created_at: string
          id: string
          is_video_call: boolean
          peer_data: Json | null
          receiver_id: string
          updated_at: string
        }
        Insert: {
          call_status?: string
          caller_id: string
          created_at?: string
          id?: string
          is_video_call?: boolean
          peer_data?: Json | null
          receiver_id: string
          updated_at?: string
        }
        Update: {
          call_status?: string
          caller_id?: string
          created_at?: string
          id?: string
          is_video_call?: boolean
          peer_data?: Json | null
          receiver_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      advanced_directives: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          directive_type: string
          end_date: string | null
          id: string
          patient_id: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          directive_type: string
          end_date?: string | null
          id?: string
          patient_id: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          directive_type?: string
          end_date?: string | null
          id?: string
          patient_id?: string
          start_date?: string
          status?: string | null
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
          date_identified: string
          id: string
          patient_id: string
          reaction: string
          severity: string
          status: string
          updated_at: string | null
        }
        Insert: {
          allergen: string
          created_at?: string | null
          date_identified: string
          id?: string
          patient_id: string
          reaction: string
          severity: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          allergen?: string
          created_at?: string | null
          date_identified?: string
          id?: string
          patient_id?: string
          reaction?: string
          severity?: string
          status?: string
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
          status: string
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
          {
            foreignKeyName: "appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      call_lights: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          message: string | null
          organization: string | null
          patient_id: string
          request_type: string
          room_number: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          message?: string | null
          organization?: string | null
          patient_id: string
          request_type: string
          room_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          message?: string | null
          organization?: string | null
          patient_id?: string
          request_type?: string
          room_number?: string
          status?: string
          updated_at?: string
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
          created_at: string
          description: string | null
          from_user_id: string | null
          id: string
          metadata: Json | null
          reward_category: string | null
          status: string | null
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
          status?: string | null
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
          status?: string | null
          to_user_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_coins_transactions_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_coins_transactions_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      care_plans: {
        Row: {
          content: string
          created_at: string
          id: string
          is_ai_generated: boolean
          patient_id: string
          provider_id: string
          status: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_ai_generated?: boolean
          patient_id: string
          provider_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_ai_generated?: boolean
          patient_id?: string
          provider_id?: string
          status?: string
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
          {
            foreignKeyName: "care_plans_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          updated_at: string
          vital_signs: Json | null
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
          updated_at?: string
          vital_signs?: Json | null
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
          updated_at?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_records_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
          timestamp: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
          timestamp?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          patient_id: string
          revised_by: string | null
          score: string | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          patient_id: string
          revised_by?: string | null
          score?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          patient_id?: string
          revised_by?: string | null
          score?: string | null
          status?: string | null
          type?: string | null
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
      food_orders: {
        Row: {
          created_at: string | null
          delivery_time: string | null
          id: string
          ordered_by_id: string | null
          patient_id: string | null
          room_number: string | null
          special_instructions: string | null
          status: Database["public"]["Enums"]["usfoods_order_status"] | null
          updated_at: string | null
          usfoods_order_id: string | null
          usfoods_tracking_info: Json | null
        }
        Insert: {
          created_at?: string | null
          delivery_time?: string | null
          id?: string
          ordered_by_id?: string | null
          patient_id?: string | null
          room_number?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["usfoods_order_status"] | null
          updated_at?: string | null
          usfoods_order_id?: string | null
          usfoods_tracking_info?: Json | null
        }
        Update: {
          created_at?: string | null
          delivery_time?: string | null
          id?: string
          ordered_by_id?: string | null
          patient_id?: string | null
          room_number?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["usfoods_order_status"] | null
          updated_at?: string | null
          usfoods_order_id?: string | null
          usfoods_tracking_info?: Json | null
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
      group_calls: {
        Row: {
          created_at: string
          id: string
          initiator_id: string
          is_video_call: boolean
          participants: Json
          room_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiator_id: string
          is_video_call?: boolean
          participants?: Json
          room_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          initiator_id?: string
          is_video_call?: boolean
          participants?: Json
          room_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      imaging_records: {
        Row: {
          body_area: string
          date_performed: string
          findings: string | null
          id: string
          image_url: string | null
          imaging_type: string
          notes: string | null
          patient_id: string
        }
        Insert: {
          body_area: string
          date_performed?: string
          findings?: string | null
          id?: string
          image_url?: string | null
          imaging_type: string
          notes?: string | null
          patient_id: string
        }
        Update: {
          body_area?: string
          date_performed?: string
          findings?: string | null
          id?: string
          image_url?: string | null
          imaging_type?: string
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imaging_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      immunizations: {
        Row: {
          created_at: string | null
          created_by: string | null
          cvx_code: string | null
          date_administered: string | null
          id: string
          patient_id: string
          source: string | null
          status: string | null
          updated_at: string | null
          vaccine: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          cvx_code?: string | null
          date_administered?: string | null
          id?: string
          patient_id: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
          vaccine: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          cvx_code?: string | null
          date_administered?: string | null
          id?: string
          patient_id?: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
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
          date_performed: string
          flagged: boolean | null
          id: string
          normal_range: string | null
          notes: string | null
          patient_id: string
          test_name: string
          test_result: string
          units: string | null
        }
        Insert: {
          date_performed?: string
          flagged?: boolean | null
          id?: string
          normal_range?: string | null
          notes?: string | null
          patient_id: string
          test_name: string
          test_result: string
          units?: string | null
        }
        Update: {
          date_performed?: string
          flagged?: boolean | null
          id?: string
          normal_range?: string | null
          notes?: string | null
          patient_id?: string
          test_name?: string
          test_result?: string
          units?: string | null
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
          classification: string | null
          clinical_category: string | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          patient_id: string
          pdpm_comorbidities: string | null
          rank: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          classification?: string | null
          clinical_category?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          patient_id: string
          pdpm_comorbidities?: string | null
          rank?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          classification?: string | null
          clinical_category?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          patient_id?: string
          pdpm_comorbidities?: string | null
          rank?: string | null
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
      medications: {
        Row: {
          dosage: string
          duration: string | null
          frequency: string
          id: string
          instructions: string | null
          medication_name: string
          patient_id: string
          prescribed_date: string
          status: string
        }
        Insert: {
          dosage: string
          duration?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          medication_name: string
          patient_id: string
          prescribed_date?: string
          status?: string
        }
        Update: {
          dosage?: string
          duration?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          medication_name?: string
          patient_id?: string
          prescribed_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergen_warnings: string[] | null
          brand: string | null
          category: string
          created_at: string | null
          description: string | null
          dietary_info: Json | null
          id: string
          image_url: string | null
          ingredients: string | null
          is_available: boolean | null
          name: string
          nutrition_facts: Json | null
          preparation_instructions: string | null
          serving_size: string | null
          unit_price: number | null
          unit_size: string | null
          updated_at: string | null
          usfoods_id: string | null
        }
        Insert: {
          allergen_warnings?: string[] | null
          brand?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          dietary_info?: Json | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_available?: boolean | null
          name: string
          nutrition_facts?: Json | null
          preparation_instructions?: string | null
          serving_size?: string | null
          unit_price?: number | null
          unit_size?: string | null
          updated_at?: string | null
          usfoods_id?: string | null
        }
        Update: {
          allergen_warnings?: string[] | null
          brand?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          dietary_info?: Json | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_available?: boolean | null
          name?: string
          nutrition_facts?: Json | null
          preparation_instructions?: string | null
          serving_size?: string | null
          unit_price?: number | null
          unit_size?: string | null
          updated_at?: string | null
          usfoods_id?: string | null
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
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string | null
          notes: string | null
          order_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          notes?: string | null
          order_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          notes?: string | null
          order_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "food_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_dietary_restrictions: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          patient_id: string | null
          restrictions: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          restrictions: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          restrictions?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_dietary_restrictions_patient_id_fkey"
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
          created_at: string
          date_of_birth: string
          email: string | null
          facial_data: string | null
          first_name: string
          gender: string
          id: string
          insurance_provider: string | null
          last_name: string
          medical_record_number: string | null
          phone: string | null
          policy_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth: string
          email?: string | null
          facial_data?: string | null
          first_name: string
          gender: string
          id?: string
          insurance_provider?: string | null
          last_name: string
          medical_record_number?: string | null
          phone?: string | null
          policy_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string
          email?: string | null
          facial_data?: string | null
          first_name?: string
          gender?: string
          id?: string
          insurance_provider?: string | null
          last_name?: string
          medical_record_number?: string | null
          phone?: string | null
          policy_number?: string | null
          updated_at?: string
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
            foreignKeyName: "prescriptions_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          frequency: string
          id: string
          patient_id: string
          position: string
          status: string | null
          task_description: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          frequency: string
          id?: string
          patient_id: string
          position: string
          status?: string | null
          task_description: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          frequency?: string
          id?: string
          patient_id?: string
          position?: string
          status?: string | null
          task_description?: string
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
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preferences: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          preferences?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          preferences?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          care_coins_balance: number | null
          created_at: string
          email: string
          id: string
          last_seen: string | null
          license_number: string | null
          name: string
          online_status: boolean | null
          organization: string | null
          profile_image: string | null
          role: string
          specialty: string | null
          updated_at: string
        }
        Insert: {
          care_coins_balance?: number | null
          created_at?: string
          email: string
          id: string
          last_seen?: string | null
          license_number?: string | null
          name: string
          online_status?: boolean | null
          organization?: string | null
          profile_image?: string | null
          role: string
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          care_coins_balance?: number | null
          created_at?: string
          email?: string
          id?: string
          last_seen?: string | null
          license_number?: string | null
          name?: string
          online_status?: boolean | null
          organization?: string | null
          profile_image?: string | null
          role?: string
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vital_signs: {
        Row: {
          blood_pressure: string | null
          date_recorded: string
          heart_rate: number | null
          height: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          patient_id: string
          respiratory_rate: number | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure?: string | null
          date_recorded?: string
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id: string
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure?: string | null
          date_recorded?: string
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id?: string
          respiratory_rate?: number | null
          temperature?: number | null
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
      care_coins_reward_analytics: {
        Row: {
          reward_category: string | null
          reward_date: string | null
          total_amount: number | null
          transaction_count: number | null
          transaction_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_patient: {
        Args: {
          p_first_name: string
          p_last_name: string
          p_date_of_birth: string
          p_gender: string
          p_email?: string
          p_phone?: string
          p_address?: string
          p_medical_record_number?: string
          p_insurance_provider?: string
          p_policy_number?: string
          p_facial_data?: string
        }
        Returns: {
          address: string | null
          created_at: string
          date_of_birth: string
          email: string | null
          facial_data: string | null
          first_name: string
          gender: string
          id: string
          insurance_provider: string | null
          last_name: string
          medical_record_number: string | null
          phone: string | null
          policy_number: string | null
          updated_at: string
        }
      }
      distribute_care_coins_reward: {
        Args: {
          p_amount: number
          p_provider_id: string
          p_patient_id: string
          p_reward_category: string
          p_description?: string
        }
        Returns: boolean
      }
      get_all_patients: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string | null
          created_at: string
          date_of_birth: string
          email: string | null
          facial_data: string | null
          first_name: string
          gender: string
          id: string
          insurance_provider: string | null
          last_name: string
          medical_record_number: string | null
          phone: string | null
          policy_number: string | null
          updated_at: string
        }[]
      }
      get_analytics_overview: {
        Args: { provider_id_param: string; timeframe_param: string }
        Returns: {
          totalpatients: number
          appointments: number
          chartingrate: number
          carecoinsgenerated: number
          patientsgrowth: number
          appointmentsgrowth: number
          chartingrategrowth: number
          carecoinsgrowth: number
        }[]
      }
      get_appointment_analytics: {
        Args: { timeframe_param: string; provider_id_param: string }
        Returns: {
          month: string
          scheduled: number
          completed: number
          cancelled: number
        }[]
      }
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_care_coins_analytics: {
        Args: { user_id_param: string; timeframe_param: string }
        Returns: {
          month: string
          earned: number
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
      get_patient_by_id: {
        Args: { p_patient_id: string }
        Returns: {
          address: string | null
          created_at: string
          date_of_birth: string
          email: string | null
          facial_data: string | null
          first_name: string
          gender: string
          id: string
          insurance_provider: string | null
          last_name: string
          medical_record_number: string | null
          phone: string | null
          policy_number: string | null
          updated_at: string
        }
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
          month: string
          newpatients: number
          activepatients: number
          discharge: number
        }[]
      }
      get_provider_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          name: string
          "Dr. Smith": number
          "Dr. Johnson": number
          "Dr. Williams": number
          "Dr. Brown": number
        }[]
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
      order_status:
        | "pending"
        | "approved"
        | "preparing"
        | "delivered"
        | "cancelled"
      usfoods_order_status:
        | "pending"
        | "submitted_to_usfoods"
        | "confirmed"
        | "in_transit"
        | "delivered"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "pending",
        "approved",
        "preparing",
        "delivered",
        "cancelled",
      ],
      usfoods_order_status: [
        "pending",
        "submitted_to_usfoods",
        "confirmed",
        "in_transit",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
