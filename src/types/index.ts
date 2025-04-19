// Health prediction types for AI-powered health analytics
import { Json } from '@/integrations/supabase/types';

export interface HealthPrediction {
  id: string;
  patient_id: string;
  prediction_type: string;
  prediction_data: Record<string, any>;
  confidence_score: number;
  created_at: string;
  updated_at: string;
  model_version: string;
  verified_by?: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface RiskAssessmentData {
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
  };
  medical_history?: string[];
  current_medications?: string[];
  lifestyle_factors?: {
    smoking?: boolean;
    alcohol_consumption?: string;
    exercise_frequency?: string;
  };
}

export interface CoinsSummary {
  total_earned: number;
  total_spent: number; 
  total_rewards: number;
  rewards_by_category?: Record<string, number>;
}

export interface ExchangeRate {
  id: string;
  currency_code: string;
  rate_to_usd: number;
  last_updated: string;
}

export interface CashOutResult {
  success: boolean;
  message?: string;
  transaction_id?: string;
  usd_amount?: number;
}

export interface BillPaymentResult {
  success: boolean;
  message?: string;
  transaction_id?: string;
  payment_id?: string;
}

// CareCoins related types
export interface CareCoinsTransaction {
  id: string;
  from_user_id?: string;
  to_user_id?: string;
  amount: number;
  transaction_type: "transfer" | "reward" | "purchase";
  status?: string;
  created_at: string;
  description?: string;
  reward_category?: string;
  metadata?: any;
  otherUserName?: string;
}

export interface CareCoinsCard {
  id: string;
  user_id: string;
  card_number?: string;
  expiration_date?: string;
  status: string;
  card_type: string;
  limit_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CareCoinsBillPayment {
  id: string;
  user_id: string;
  bill_type: string;
  amount: number;
  recipient_name: string;
  recipient_account: string;
  status: string;
  created_at: string;
  metadata?: any;
}

export interface CareCoinsAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achieved_at: string;
  description: string;
  points_awarded: number;
}
