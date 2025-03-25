
// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'doctor' | 'nurse' | 'therapist' | 'cna' | 'admin';
  specialty?: string;
  licenseNumber?: string;
  profileImage?: string;
  careCoinsBalance: number;
}

// Patient types
export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  condition: string;
  status: 'Active' | 'Stable' | 'Critical';
  lastVisit: string;
  assignedDoctor: string;
  medicalHistory?: string[];
  medications?: string[];
  allergies?: string[];
  vitalSigns?: VitalSigns;
  facialDataId?: string;
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  recordedAt?: string;
}

// Chart types
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

// Appointment types
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

// CareCoins types
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
