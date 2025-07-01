
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

export * from './auth';
