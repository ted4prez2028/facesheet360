/**
 * TypeScript types for discharge summary system
 */

export interface DischargeCondition {
  condition: 'stable' | 'improved' | 'fair' | 'critical';
  details?: string;
}

export interface DischargeDisposition {
  disposition: 'home' | 'snf' | 'rehab' | 'ama' | 'expired' | 'hospice' | 'other';
  details?: string;
}

export interface DischargeSummaryData {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    medical_record_number: string;
    gender: string;
    phone?: string;
    email?: string;
    address?: string;
    room_number?: string;
  };
  admission: {
    admission_date: string;
    discharge_date: string;
    discharge_condition: string;
    discharge_disposition: string;
  };
  discharge_details: {
    activity?: string;
    diet?: string;
    instructions?: string;
    follow_up?: string;
  };
  allergies: Array<{
    allergen: string;
    severity?: string;
    reaction?: string;
    status: string;
  }>;
  diagnoses: Array<{
    diagnosis_name: string;
    diagnosis_code?: string;
    diagnosis_type?: string;
    status: string;
    onset_date?: string;
  }>;
  medications: Array<{
    medication_name: string;
    dosage: string;
    route?: string;
    frequency: string;
    status: string;
    instructions?: string;
  }>;
  procedures: Array<{
    procedure_name: string;
    procedure_date: string;
    notes?: string;
  }>;
  consultations: Array<{
    specialty: string;
    consultant_name?: string;
    consultation_date: string;
    findings?: string;
    recommendations?: string;
  }>;
  vitals?: {
    temperature?: number;
    heart_rate?: number;
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    recorded_at?: string;
  };
  labs: Array<{
    test_name: string;
    result_value?: string;
    result_unit?: string;
    reference_range?: string;
    performed_at?: string;
    status: string;
  }>;
  immunizations: Array<{
    vaccine_name: string;
    administered_at: string;
    dose_number?: number;
  }>;
}

export interface DischargeFormData {
  discharge_condition: DischargeCondition['condition'];
  discharge_disposition: DischargeDisposition['disposition'];
  discharge_activity: string;
  discharge_diet: string;
  discharge_instructions: string;
  discharge_follow_up: string;
  selected_procedures: string[];
  selected_consultations: string[];
  additional_notes?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface DischargeValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  missingFields: string[];
}
