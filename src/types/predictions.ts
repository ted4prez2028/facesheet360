
export interface HealthPrediction {
  id: string;
  patient_id: string;
  prediction_type: string;
  prediction_data: Record<string, unknown>;
  confidence_score: number;
  created_at: string;
  updated_at: string;
  model_version: string;
  verified_by?: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface RiskAssessmentData {
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
  };
  medical_history?: string[];
  current_medications?: string[];
  lifestyle_factors?: {
    smoking?: boolean;
    alcohol_consumption?: string;
    exercise_frequency?: string;
  };
}
