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
  [key: string]: any; // Index signature for compatibility
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
  address?: string;
  policy_number?: string;
  // Additional patient properties for compatibility
  blood_pressure?: string;
  temperature?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  [key: string]: any; // Index signature for compatibility
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
    medical_record_number?: string;
  };
  patient?: string;
  created_at?: string;
  updated_at?: string;
  type?: string;
  [key: string]: any; // Index signature for compatibility
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
  [key: string]: any; // Index signature for compatibility
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
  [key: string]: any; // Index signature for compatibility
}

export interface Message {
  id: string;
  created_at: string;
  from_user_id: string | null;
  to_user_id: string | null;
  content: string | null;
  sender_id?: string;
  timestamp?: string;
  [key: string]: any; // Index signature for compatibility
}

export interface ChatWindow {
  userId: string;
  userName: string;
  minimized: boolean;
  messages?: Message[];
  [key: string]: any; // Index signature for compatibility
}

export interface RecentPatient {
  id: string;
  name: string;
  lastVisit: string;
  age: number;
  condition: string;
  status: string;
  [key: string]: any; // Index signature for compatibility
}

export interface TodayAppointment {
  id: string;
  time: string;
  patient: string;
  type: string;
  duration: number;
  [key: string]: any; // Index signature for compatibility
}

export interface PendingTask {
  id: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  due: string;
  [key: string]: any; // Index signature for compatibility
}

export interface CarePlan {
  id: string;
  patient_id: string;
  content: string;
  status: 'active' | 'completed' | 'draft';
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Index signature for compatibility
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
  date_identified?: string;
  status?: string;
  category?: string;
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

// Additional interfaces for missing types
export interface Evaluation {
  id: string;
  patient_id: string;
  type?: string;
  category?: string;
  score?: string;
  status: string;
  description: string;
  created_by?: string;
  revised_by?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Index signature for DataItem compatibility
}

export interface Immunization {
  id?: string;
  patient_id?: string;
  vaccine: string;
  cvxCode: string;
  cvx_code?: string;
  dateAdministered?: string;
  date_administered?: string;
  status: string;
  source: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Index signature for DataItem compatibility
}

export interface Diagnosis {
  id?: string;
  patient_id?: string;
  code: string;
  description: string;
  category: string;
  clinical_category?: string;
  date: string;
  rank: string;
  classification: string;
  pdmp_comorbidities?: string;
  createdDate: string;
  createdBy: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  [key: string]: any; // Index signature for DataItem compatibility
}

export interface Order {
  id: string;
  patient_id: string;
  type: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Index signature for DataItem compatibility
}

export interface CareCoinsTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'reward' | 'transfer' | 'purchase' | 'expense';
  description: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  [key: string]: any;
}
