// If this file doesn't exist, this will create it
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty?: string;
  license_number?: string;
  profile_image?: string;
  care_coins_balance?: number;
  careCoinsBalance?: number;
  online_status?: boolean;
  last_seen?: string;
  organization?: string;
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

export interface Call {
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  isVideoCall: boolean;
  status: 'ringing' | 'ongoing' | 'ended';
}

export interface ChatWindow {
  userId: string;
  userName: string;
  minimized: boolean;
  messages: Message[];
}

export interface ContactsState {
  onlineUsers: User[];
  isOpen: boolean;
}

export interface GroupCall {
  id: string;
  room_id: string;
  initiator_id: string;
  is_video_call: boolean;
  status: string;
  participants: string[];
  created_at: string;
  updated_at: string;
}

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
  facial_data?: string;
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
}

export interface CareCoinsTransaction {
  id: string;
  from_user_id?: string;
  to_user_id?: string;
  amount: number;
  transaction_type: "transfer" | "reward" | "purchase";
  description?: string;
  reward_category?: string;
  created_at: string;
  otherUserName?: string;
}

interface PatientInfo {
  first_name: string;
  last_name: string;
}

interface ProviderInfo {
  name: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  provider_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  start_date: string;
  end_date?: string;
  status: string;
  administered_at?: string;
  administered_by?: string;
  created_at: string;
  updated_at: string;
  patients?: PatientInfo;
  providers?: ProviderInfo;
}

export interface CallLightRequest {
  id: string;
  patient_id: string;
  room_number: string;
  request_type: 'assistance' | 'emergency' | 'pain' | 'bathroom' | 'water' | 'other';
  message?: string;
  status: 'active' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at?: string;
  completed_by?: string;
  organization?: string;
}

export interface PreferenceType {
  theme: string;
  dashboardLayout: string;
  notification: boolean;
  soundEnabled: boolean;
}

export interface PatientHeaderProps {
  patient: Patient;
  calculateAge?: (dob: string) => number;
}

export interface PatientsListProps {
  patients: Patient[];
  filteredPatients: Patient[];
  isLoading: boolean;
  error: Error | null;
  handleDeletePatient: (id: string) => void;
}

export interface PatientToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}
