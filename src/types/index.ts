export interface User {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'nurse' | 'therapist' | 'cna';
  specialty?: string;
  license_number?: string;
  profile_image?: string;
  care_coins_balance: number;
  organization?: string;
  online_status?: boolean;
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  name?: string;
  age?: number;
  date_of_birth: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  medical_record_number?: string;
  insurance_provider?: string;
  insurance_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  allergies?: string;
  medications?: string;
  medical_history?: string;
  notes?: string;
  facial_data?: string;
  user_id?: string;
  status?: string;
  lastVisit?: string;
  imgUrl?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  appointment_date: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TodayAppointment {
  id: string;
  time: string;
  patient: string;
  type: string;
  duration: number;
}

export interface RecentPatient {
  id: string;
  name: string;
  lastVisit: string;
  age: number;
  condition: string;
  status: string;
}

export interface PendingTask {
  id: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  due: string;
}

export interface Message {
  id: string;
  content: string;
  author: string;
  platform: string;
  user_id: string;
  created_at: string;
  is_read: boolean;
  message_type?: string;
  replied?: boolean;
  reply_content?: string;
  replied_at?: string;
  updated_at?: string;
}

export interface Call {
  id: string;
  caller_id: string;
  callee_id: string;
  status: 'pending' | 'active' | 'ended' | 'missed';
  is_video_call: boolean;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface CareCoinsCard {
  id: string;
  user_id: string;
  card_type: 'virtual' | 'physical';
  status: 'pending' | 'active' | 'suspended';
  limit_amount: number;
  created_at: string;
  updated_at: string;
}

// Call Light types
export interface CallLightRequest {
  id: string;
  patient_id: string;
  request_type: string;
  message?: string;
  status: 'active' | 'in_progress' | 'completed';
  created_at: string;
  completed_at?: string;
  completed_by?: string;
}

export interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  instructions?: string;
  status: 'prescribed' | 'administered' | 'discontinued';
  patient_id: string;
  provider_id: string;
  administered_at?: string;
  administered_by?: string;
  created_at: string;
  updated_at: string;
}

// CareCoins types
export interface CareCoinsTransaction {
  id: string;
  amount: number;
  transaction_type: 'transfer' | 'reward' | 'purchase' | 'deposit' | 'withdrawal' | 'platform_fee' | 'earned' | 'spent';
  description?: string;
  created_at: string;
  from_user_id?: string;
  to_user_id?: string;
  reward_category?: string;
  metadata?: Record<string, unknown>;
}

export interface CarePlan {
  id: string;
  patient_id: string;
  content: string;
  status: 'active' | 'completed' | 'draft';
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface VitalSigns {
  id: string;
  patient_id: string;
  temperature?: number;
  blood_pressure?: string;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  date_recorded: string;
  created_at: string;
  updated_at: string;
}

export interface ChartRecord {
  id: string;
  patient_id: string;
  provider_id: string;
  record_type: string;
  record_date: string;
  diagnosis?: string;
  vital_signs?: Record<string, unknown>;
  vitals?: Record<string, unknown>;
  medications?: Record<string, unknown>;
  treatment_plan?: string;
  notes?: string;
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
  bill_info?: Record<string, unknown>;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface CareCoinsAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description?: string;
  reward_amount: number;
  achieved_at: string;
  created_at: string;
}

export * from './auth';
