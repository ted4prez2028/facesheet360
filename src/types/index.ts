
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
