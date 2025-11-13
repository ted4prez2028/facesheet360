// Temporary type definitions for tables that exist in database but haven't synced to types file yet

export interface FacialDataRecord {
  id: string;
  patient_id: string;
  captured_by: string;
  confidence_score: number;
  capture_method: string;
  notes: string;
  captured_at: string;
  created_at: string;
}

export interface MedicationAdministrationRecord {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  route: string;
  administered_at: string;
  administered_by: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PharmacyInventoryItem {
  id: string;
  medication_name: string;
  quantity: number;
  unit: string;
  reorder_threshold: number;
  location?: string;
  expiration_date?: string;
  lot_number?: string;
  supplier?: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionFill {
  id: string;
  patient_id: string;
  medication_name: string;
  quantity_filled: number;
  filled_by: string;
  filled_at: string;
  prescription_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PharmacyAnalytic {
  id: string;
  medication_name: string;
  metric_type: string;
  metric_value: number;
  recorded_at: string;
  notes?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  created_at: string;
  updated_at: string;
  last_message?: any;
  last_message_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  attachment_url?: string;
}
