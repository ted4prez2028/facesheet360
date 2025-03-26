// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'nurse' | 'therapist' | 'cna' | 'admin';
  specialty?: string;
  licenseNumber?: string;
  profileImage?: string;
  careCoinsBalance: number;
  walletAddress?: string;
}

// Patient types
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
  policy_number?: string;
  facial_data?: string;
  condition?: string;
  status?: 'Active' | 'Stable' | 'Critical';
  assignedDoctor?: string;
  medicalHistory?: string[];
  medications?: string[];
  allergies?: string[];
  vitalSigns?: VitalSigns;
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  recordedAt?: string;
}

export interface ChartNote {
  _id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  type: 'Progress Note' | 'Lab Results' | 'Medication' | 'Vital Signs' | 'Imaging';
  content: string;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
}

export interface Attachment {
  _id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show';
  notes?: string;
}

export interface CareCoinsTransaction {
  _id: string;
  fromUserId?: string;
  fromUserName?: string;
  toUserId?: string;
  toUserName?: string;
  amount: number;
  type: 'Earn' | 'Transfer' | 'Receive';
  reason: string;
  timestamp: string;
  walletAddress?: string;
}
