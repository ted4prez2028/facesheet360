
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
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
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
