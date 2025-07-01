
export interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: 'doctor' | 'nurse' | 'therapist' | 'cna' | 'admin';
  specialty?: string;
  license_number?: string;
  profile_image?: string;
  care_coins_balance?: number;
  online_status?: boolean;
  organization?: string;
  created_at?: string;
  updated_at?: string;
  // Additional properties for compatibility
  first_name?: string;
  last_name?: string;
}

export interface Patient {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  date_of_birth: string;
  gender: string;
  medical_record_number: string;
  admission_date?: string;
  discharge_date?: string;
  room_number?: string;
  bed_number?: string;
  primary_diagnosis?: string;
  allergies?: string[];
  medications?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  created_at?: string;
  updated_at?: string;
  age?: number;
  condition?: string;
  email?: string;
  phone?: string;
  // Additional patient properties for compatibility
  blood_pressure?: string;
  temperature?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patientId: string;
  patientName: string;
  doctor_id: string;
  appointment_date: string;
  date?: string;
  appointment_time: string;
  duration?: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  patients?: {
    first_name: string;
    last_name: string;
    medical_record_number: string;
  };
  patient?: string;
  created_at?: string;
  updated_at?: string;
  type?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  instructions?: string;
  status: 'active' | 'completed' | 'discontinued';
  created_at?: string;
  updated_at?: string;
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

export interface Message {
  id: string;
  created_at: string;
  from_user_id: string | null;
  to_user_id: string | null;
  content: string | null;
  sender_id?: string;
  timestamp?: string;
}

export interface ChatWindow {
  userId: string;
  userName: string;
  minimized: boolean;
  messages?: Message[];
}

export interface RecentPatient {
  id: string;
  name: string;
  lastVisit: string;
  age: number;
  condition: string;
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

// Additional types for compatibility
export interface Allergy {
  id?: string;
  patient_id?: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  type: string;
  notes?: string;
  [key: string]: any; // Index signature for DataItem compatibility
}

export interface CensusEntry {
  id: string;
  name: string;
  room: string;
  status: string;
  admitted: string;
  [key: string]: any; // Index signature for DataItem compatibility
}

export interface DataItem {
  [key: string]: any;
}
