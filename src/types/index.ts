
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
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
  medical_history?: string;
  allergies?: string;
  medications?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  // Computed fields
  name?: string;
  age?: number;
  status?: string;
  lastVisit?: string;
  imgUrl?: string;
  provider_id?: string;
}

export interface VitalSigns {
  id: string;
  patient_id: string;
  date_recorded: string;
  heart_rate?: number;
  blood_pressure?: string;
  temperature?: number;
  oxygen_saturation?: number;
  respiratory_rate?: number;
  weight?: number;
  height?: number;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  appointment_date: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  patientId?: string;
  patientName?: string;
  doctor_id?: string;
  duration?: number;
  date?: string;
  time?: string;
  patient?: string;
  type?: string;
  patients?: {
    first_name: string;
    last_name: string;
    medical_record_number: string;
  };
}

export interface ChartRecord {
  id: string;
  patient_id: string;
  provider_id: string;
  record_type: string;
  record_date: string;
  notes?: string;
  vitals?: any;
  diagnosis?: string;
  treatment_plan?: string;
  vital_signs?: any;
  medications?: any;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  provider_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  instructions?: string;
  status: "prescribed" | "administered" | "cancelled";
  administered_by?: string;
  administered_at?: string;
  created_at: string;
  updated_at: string;
  patients?: {
    first_name: string;
    last_name: string;
    medical_record_number: string;
  };
}

export interface Task {
  id: string;
  patient_id: string;
  task_description: string;
  position?: string;
  frequency?: string;
  status: string;
  completed_at?: string;
  completed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Immunization {
  id: string;
  patient_id: string;
  vaccine: string;
  cvx_code?: string;
  status: string;
  source?: string;
  date_administered?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalDiagnosis {
  id: string;
  patient_id: string;
  code: string;
  description: string;
  clinical_category?: string;
  category?: string;
  rank?: string;
  classification?: string;
  pdmp_comorbidities?: string;
  date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HealthPrediction {
  id: string;
  patient_id: string;
  prediction_type: string;
  prediction_data: any;
  confidence_score: number;
  status: string;
  model_version: string;
  created_at: string;
  updated_at: string;
}

export interface CareCoinsTransaction {
  id: string;
  from_user_id?: string;
  to_user_id?: string;
  amount: number;
  transaction_type: string;
  description?: string;
  reward_category?: string;
  metadata?: any;
  created_at: string;
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
  status: string;
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
