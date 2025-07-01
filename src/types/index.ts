
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
  created_at?: string;
  updated_at?: string;
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
  patients?: {
    first_name: string;
    last_name: string;
  };
}
