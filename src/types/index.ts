export interface User {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  title?: string;
  specialty?: string;
  license_number?: string;
  profile_image?: string;
  care_coins_balance?: number;
  online_status?: boolean;
  organization?: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  insurance_provider: string;
  insurance_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  medical_history: string;
  allergies: string;
  medications: string;
  notes: string;
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
}

export interface ChatWindow {
  userId: string;
  userName: string;
  isOpen: boolean;
  isMinimized: boolean;
  messages: Message[];
}

export interface Call {
  id: string;
  caller_id: string;
  callee_id: string;
  is_video_call: boolean;
  status: 'pending' | 'active' | 'ended';
  created_at: string;
  updated_at: string;
}

export interface ContactsState {
  onlineUsers: User[];
  isOpen: boolean;
}

export interface CareCoinsTransaction {
  id: string;
  user_id: string;
  transaction_type: 'reward' | 'transfer' | 'purchase' | 'stake' | 'unstake';
  amount: number;
  description: string;
  created_at: string;
  recipient_id?: string;
  status: 'pending' | 'completed' | 'failed';
}
