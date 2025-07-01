
export interface User {
  id?: string;
  first_name?: string;
  last_name?: string;
  name?: string; // Add name property for compatibility
  email?: string;
  phone?: string;
  role?: string;
  title?: string;
  specialty?: string;
  license_number?: string;
  profile_image?: string;
  care_coins_balance?: number;
  careCoinsBalance?: number; // Add alias for compatibility
  online_status?: boolean;
  organization?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  credits?: number;
  remaining_credits?: number;
  total_credits?: number;
  is_admin?: boolean;
  image_url?: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  name?: string; // Add for compatibility
  date_of_birth: string;
  dob?: string; // Add alias
  gender: string;
  phone: string;
  contact_number?: string; // Add alias
  email: string;
  address: string;
  insurance_provider: string;
  insurance_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  medical_history: string;
  known_conditions?: string; // Add alias
  allergies: string;
  medications: string;
  notes: string;
  medical_record_number?: string;
  age?: number;
  condition?: string;
  status?: string;
  lastVisit?: string;
  imgUrl?: string;
  created_at?: string;
  provider_id?: string;
}

export interface PreferenceType {
  themeMode: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  language: 'en' | 'es' | 'fr';
}

export const defaultPreferences: PreferenceType = {
  themeMode: 'system',
  notificationsEnabled: true,
  language: 'en',
};

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  timestamp: string;
  created_at?: string;
  from_user_id?: string;
  to_user_id?: string;
}

export interface ChatWindow {
  userId: string;
  userName: string;
  isOpen: boolean;
  isMinimized: boolean;
  minimized?: boolean; // Add alias for compatibility
  messages: Message[];
}

export interface Call {
  id: string;
  caller_id: string;
  callerId?: string; // Add alias for compatibility
  callee_id: string;
  receiverId?: string; // Add alias for compatibility
  callerName?: string;
  receiverName?: string;
  is_video_call: boolean;
  isVideoCall?: boolean; // Add alias for compatibility
  status: 'pending' | 'active' | 'ended' | 'ongoing'; // Add ongoing status
  created_at: string;
  updated_at: string;
  otherUserName?: string;
}

export interface ContactsState {
  onlineUsers: User[];
  isOpen: boolean;
}

export interface CareCoinsTransaction {
  id: string;
  user_id: string;
  from_user_id?: string; // Add missing property
  to_user_id?: string;
  transaction_type: 'reward' | 'transfer' | 'purchase' | 'stake' | 'unstake';
  amount: number;
  description: string;
  created_at: string;
  recipient_id?: string;
  status: 'pending' | 'completed' | 'failed';
  otherUserName?: string;
  reward_category?: string; // Add missing property
}

export interface CallLightRequest {
  id: string;
  room_number: string;
  request_type: string;
  status: 'active' | 'in_progress' | 'completed';
  message?: string;
  created_at: string;
  completed_at?: string;
  patient_id?: string;
  patients?: {
    first_name: string;
    last_name: string;
  };
}

export interface CallLightWithPatient {
  id: string;
  room_number: string;
  request_type: string;
  status: 'active' | 'in_progress' | 'completed';
  message?: string;
  created_at: string;
  completed_at?: string;
  patient_id?: string;
  patients?: {
    first_name: string;
    last_name: string;
  };
}

export interface RecentPatient {
  id: string;
  name: string;
  lastVisit: string;
  age: number;
  condition: string;
  status: string; // Add required status property
}

export interface TodayAppointment {
  id: string;
  time: string;
  patient: string;
  type: string;
  duration: number;
}

export interface PendingTask {
  id: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  due: string;
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

export interface Prescription {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescriber_id: string;
  status: 'active' | 'completed' | 'discontinued';
  created_at: string;
  start_date: string;
  end_date?: string;
  patients?: {
    first_name: string;
    last_name: string;
  };
  providers?: {
    name: string;
  };
}

export interface Appointment {
  id: string;
  created_at: string;
  appointment_date: string | null;
  appointment_time: string | null;
  patient_id: string | null;
  provider_id: string | null;
  notes: string | null;
  patientId?: string;
  patientName?: string;
  doctor_id?: string;
  duration?: number;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  date?: string;
  patient?: string;
  patients?: {
    first_name: string;
    last_name: string;
    medical_record_number: string;
  };
}

export interface ChartRecord {
  id: string;
  created_at: string;
  patient_id: string | null;
  provider_id: string | null;
  notes: string | null;
  vitals: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
}

export interface MedicationReminder {
  id: string;
  created_at: string;
  patient_id: string | null;
  medication_name: string | null;
  dosage: string | null;
  frequency: string | null;
  time: string | null;
  notes: string | null;
  last_taken: string | null;
  is_active: boolean | null;
}

export interface PatientDataForCarePlan {
  id: string; // Make id required
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  vitalSigns?: any[];
  medications?: string[];
  medicalHistory?: string[];
  condition?: string;
  allergies?: string; // Change from string[] to string
  age?: number;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  insurance_provider?: string;
  insurance_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  medical_history?: string;
  notes?: string;
  medical_record_number?: string;
  status?: string;
  lastVisit?: string;
  imgUrl?: string;
  created_at?: string;
  provider_id?: string;
}
