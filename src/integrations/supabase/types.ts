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
      care_coins_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          from_user_id: string | null
          id: string
          to_user_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          from_user_id?: string | null
          id?: string
          to_user_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          from_user_id?: string | null
          id?: string
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
      users: {
        Row: {
          care_coins_balance: number | null
          created_at: string
          email: string
          id: string
          license_number: string | null
          name: string
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
          license_number?: string | null
          name: string
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
          license_number?: string | null
          name?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_analytics_overview: {
        Args: {
          provider_id_param: string
          timeframe_param: string
        }
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
        Args: {
          timeframe_param: string
          provider_id_param: string
        }
        Returns: {
          month: string
          scheduled: number
          completed: number
          cancelled: number
        }[]
      }
      get_care_coins_analytics: {
        Args: {
          user_id_param: string
          timeframe_param: string
        }
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
      get_patient_demographics: {
        Args: Record<PropertyKey, never>
        Returns: {
          name: string
          value: number
        }[]
      }
      get_patient_trends: {
        Args: {
          timeframe_param: string
        }
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
      is_own_profile: {
        Args: {
          user_id: string
        }
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
