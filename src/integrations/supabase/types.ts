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
      messages: {
        Row: {
          author: string
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          platform: string
          replied: boolean | null
          replied_at: string | null
          reply_content: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          platform: string
          replied?: boolean | null
          replied_at?: string | null
          reply_content?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          platform?: string
          replied?: boolean | null
          replied_at?: string | null
          reply_content?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      users: {
        Row: {
          created_at: string
          credits: number | null
          email: string | null
          id: string
          is_admin: boolean | null
          name: string | null
          remaining_credits: number | null
          total_credits: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string | null
          remaining_credits?: number | null
          total_credits?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string | null
          remaining_credits?: number | null
          total_credits?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits_after_payment: {
        Args: {
          p_user_id: string
          p_credits: number
          p_payment_id: string
          p_provider: string
        }
        Returns: boolean
      }
      assess_health_risks: {
        Args: { patient_id_param: string; assessment_data: Json }
        Returns: Json
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
    },
  },
} as const
