
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

// Add missing types referenced in other components
export interface User {
  id: string;
  email: string | null;
  name: string | null;
  image_url: string | null;
  care_coins_balance: number | null;
  role?: string;
  specialty?: string;
  license_number?: string;
  profile_image?: string;
  online_status?: string;
  organization?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Patient {
  id: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  medical_record_number?: string;
  insurance_provider?: string;
  policy_number?: string;
  facial_data?: string;
  name?: string | null;
  dob?: string | null;
  contact_number?: string | null;
  known_conditions?: string | null;
  allergies?: string | null;
  medications?: string | null;
  notes?: string | null;
  provider_id?: string | null;
  insurance_number?: string | null;
}

export interface Prescription {
  id: string;
  patient_id: string;
  provider_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  start_date: string;
  end_date?: string;
  instructions?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  created_at: string;
  from_user_id: string | null;
  to_user_id: string | null;
  content: string | null;
}

export interface Call {
  id: string;
  created_at: string;
  from_user_id: string | null;
  to_user_id: string | null;
  accepted: boolean | null;
  ended_at: string | null;
  isVideo: boolean | null;
  otherUserName?: string;
}

export interface ChatWindow {
  userId: string;
  userName: string;
  minimized: boolean;
}

export interface ContactsState {
  onlineUsers: User[];
  isOpen: boolean;
}

export interface CallLightRequest {
  id: string;
  created_at: string;
  patient_id: string;
  request_type: string;
  status: string;
  room_number: string;
  message?: string;
  completed_at?: string;
  completed_by?: string;
  organization?: string;
  updated_at?: string;
}

export interface CallLightWithPatient extends CallLightRequest {
  patients?: Patient;
}
