export interface User {
  id: string;
  email: string | null;
  name: string | null;
  image_url: string | null;
  care_coins_balance: number | null;
}

export interface Patient {
  id: string;
  created_at: string;
  name: string | null;
  dob: string | null;
  gender: string | null;
  contact_number: string | null;
  address: string | null;
  insurance_provider: string | null;
  insurance_number: string | null;
  known_conditions: string | null;
  allergies: string | null;
  medications: string | null;
  notes: string | null;
  provider_id: string | null;
}

export interface Appointment {
  id: string;
  created_at: string;
  appointment_date: string | null;
  appointment_time: string | null;
  patient_id: string | null;
  provider_id: string | null;
  notes: string | null;
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

export interface CareCoinsTransaction {
  id: string;
  amount: number;
  from_user_id: string | null;
  to_user_id: string | null;
  transaction_type: "transfer" | "reward" | "purchase";
  created_at: string;
  description: string | null;
  otherUserName?: string;
}
