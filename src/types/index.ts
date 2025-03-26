
export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  medical_record_number?: string;
  insurance_provider?: string;
  policy_number?: string;
  created_at: string;
  updated_at: string;
  facial_data?: string;
}

export interface ChartRecord {
  id: string;
  patient_id: string;
  provider_id: string;
  record_date: string;
  record_type: string;
  diagnosis?: string;
  notes?: string;
  vital_signs?: {
    temperature?: number;
    blood_pressure?: string;
    heart_rate?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    height?: number;
    weight?: number;
  };
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date?: string;
  }[];
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  appointment_date: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "nurse" | "staff";
  specialty?: string;
  license_number?: string;
  profile_image?: string;
  care_coins_balance?: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type?: "info" | "warning" | "success" | "error";
}

export interface CareCoinsTransaction {
  id: string;
  from_user_id?: string;
  to_user_id?: string;
  amount: number;
  transaction_type: "transfer" | "reward" | "purchase";
  description?: string;
  created_at: string;
}

export interface ContactsState {
  onlineUsers: User[];
  isOpen: boolean;
}

export interface ChatWindow {
  userId: string;
  userName: string;
  minimized: boolean;
  messages: Message[];
}

export interface Call {
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  isVideoCall: boolean;
  status: "ringing" | "ongoing" | "ended";
}
