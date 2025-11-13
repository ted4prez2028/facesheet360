/**
 * Zod Validation Schemas for Patient Forms
 * Provides client-side validation for all patient data entry
 */

import { z } from 'zod';

// Vitals Validation Schema
export const vitalsSchema = z.object({
  temperature: z.number()
    .min(90, 'Temperature must be at least 90°F')
    .max(110, 'Temperature must be less than 110°F')
    .optional()
    .nullable(),
  blood_pressure_systolic: z.number()
    .min(60, 'Systolic BP must be at least 60')
    .max(250, 'Systolic BP must be less than 250')
    .optional()
    .nullable(),
  blood_pressure_diastolic: z.number()
    .min(40, 'Diastolic BP must be at least 40')
    .max(150, 'Diastolic BP must be less than 150')
    .optional()
    .nullable(),
  heart_rate: z.number()
    .min(30, 'Heart rate must be at least 30 bpm')
    .max(220, 'Heart rate must be less than 220 bpm')
    .optional()
    .nullable(),
  respiratory_rate: z.number()
    .min(6, 'Respiratory rate must be at least 6')
    .max(60, 'Respiratory rate must be less than 60')
    .optional()
    .nullable(),
  oxygen_saturation: z.number()
    .min(0, 'O2 saturation must be at least 0%')
    .max(100, 'O2 saturation must be 100% or less')
    .optional()
    .nullable(),
  weight: z.number()
    .min(0, 'Weight must be positive')
    .max(1000, 'Weight must be less than 1000')
    .optional()
    .nullable(),
  height: z.number()
    .min(0, 'Height must be positive')
    .max(300, 'Height must be less than 300')
    .optional()
    .nullable(),
  pain_level: z.number()
    .min(0, 'Pain level must be 0-10')
    .max(10, 'Pain level must be 0-10')
    .optional()
    .nullable(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .nullable(),
});

export type VitalsFormData = z.infer<typeof vitalsSchema>;

// Medication Validation Schema
export const medicationSchema = z.object({
  medication_name: z.string()
    .trim()
    .min(1, 'Medication name is required')
    .max(200, 'Medication name must be less than 200 characters'),
  dosage: z.string()
    .trim()
    .min(1, 'Dosage is required')
    .max(100, 'Dosage must be less than 100 characters'),
  frequency: z.string()
    .trim()
    .min(1, 'Frequency is required')
    .max(100, 'Frequency must be less than 100 characters'),
  route: z.enum(['oral', 'IV', 'IM', 'SubQ', 'topical', 'inhalation', 'rectal', 'other'])
    .default('oral'),
  instructions: z.string()
    .max(500, 'Instructions must be less than 500 characters')
    .optional()
    .nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  prescribing_physician: z.string()
    .max(200, 'Physician name must be less than 200 characters')
    .optional()
    .nullable(),
});

export type MedicationFormData = z.infer<typeof medicationSchema>;

// Allergy Validation Schema
export const allergySchema = z.object({
  allergen: z.string()
    .trim()
    .min(1, 'Allergen name is required')
    .max(200, 'Allergen name must be less than 200 characters'),
  reaction: z.string()
    .trim()
    .min(1, 'Reaction description is required')
    .max(500, 'Reaction must be less than 500 characters'),
  severity: z.enum(['mild', 'moderate', 'severe', 'life-threatening'])
    .default('moderate'),
  onset_date: z.string().optional().nullable(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .nullable(),
});

export type AllergyFormData = z.infer<typeof allergySchema>;

// Immunization Validation Schema
export const immunizationSchema = z.object({
  vaccine_name: z.string()
    .trim()
    .min(1, 'Vaccine name is required')
    .max(200, 'Vaccine name must be less than 200 characters'),
  administration_date: z.string()
    .min(1, 'Administration date is required'),
  lot_number: z.string()
    .max(100, 'Lot number must be less than 100 characters')
    .optional()
    .nullable(),
  site: z.string()
    .max(100, 'Site must be less than 100 characters')
    .optional()
    .nullable(),
  administered_by: z.string()
    .max(200, 'Administrator name must be less than 200 characters')
    .optional()
    .nullable(),
  next_dose_date: z.string().optional().nullable(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .nullable(),
});

export type ImmunizationFormData = z.infer<typeof immunizationSchema>;

// Medical Diagnosis Validation Schema
export const diagnosisSchema = z.object({
  diagnosis_code: z.string()
    .trim()
    .min(1, 'Diagnosis code is required')
    .max(50, 'Diagnosis code must be less than 50 characters'),
  diagnosis_name: z.string()
    .trim()
    .min(1, 'Diagnosis name is required')
    .max(300, 'Diagnosis name must be less than 300 characters'),
  diagnosis_date: z.string()
    .min(1, 'Diagnosis date is required'),
  status: z.enum(['active', 'resolved', 'chronic', 'in_remission'])
    .default('active'),
  severity: z.enum(['mild', 'moderate', 'severe'])
    .optional()
    .nullable(),
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .nullable(),
});

export type DiagnosisFormData = z.infer<typeof diagnosisSchema>;

// Lab Result Validation Schema
export const labResultSchema = z.object({
  test_name: z.string()
    .trim()
    .min(1, 'Test name is required')
    .max(200, 'Test name must be less than 200 characters'),
  result_value: z.string()
    .trim()
    .min(1, 'Result value is required')
    .max(100, 'Result value must be less than 100 characters'),
  unit: z.string()
    .max(50, 'Unit must be less than 50 characters')
    .optional()
    .nullable(),
  reference_range: z.string()
    .max(100, 'Reference range must be less than 100 characters')
    .optional()
    .nullable(),
  test_date: z.string()
    .min(1, 'Test date is required'),
  status: z.enum(['preliminary', 'final', 'corrected', 'cancelled'])
    .default('preliminary'),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .nullable(),
});

export type LabResultFormData = z.infer<typeof labResultSchema>;

// Wound Assessment Validation Schema
export const woundAssessmentSchema = z.object({
  location: z.string()
    .trim()
    .min(1, 'Wound location is required')
    .max(200, 'Location must be less than 200 characters'),
  wound_type: z.string()
    .trim()
    .min(1, 'Wound type is required')
    .max(100, 'Wound type must be less than 100 characters'),
  length: z.number()
    .min(0, 'Length must be positive')
    .max(1000, 'Length must be reasonable')
    .optional()
    .nullable(),
  width: z.number()
    .min(0, 'Width must be positive')
    .max(1000, 'Width must be reasonable')
    .optional()
    .nullable(),
  depth: z.number()
    .min(0, 'Depth must be positive')
    .max(1000, 'Depth must be reasonable')
    .optional()
    .nullable(),
  stage: z.string()
    .max(50, 'Stage must be less than 50 characters')
    .optional()
    .nullable(),
  drainage_type: z.string()
    .max(100, 'Drainage type must be less than 100 characters')
    .optional()
    .nullable(),
  drainage_amount: z.string()
    .max(100, 'Drainage amount must be less than 100 characters')
    .optional()
    .nullable(),
  wound_edges: z.string()
    .max(200, 'Wound edges description must be less than 200 characters')
    .optional()
    .nullable(),
  surrounding_skin: z.string()
    .max(200, 'Surrounding skin description must be less than 200 characters')
    .optional()
    .nullable(),
  treatment: z.string()
    .max(500, 'Treatment must be less than 500 characters')
    .optional()
    .nullable(),
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .nullable(),
});

export type WoundAssessmentFormData = z.infer<typeof woundAssessmentSchema>;

// Patient Note Validation Schema
export const patientNoteSchema = z.object({
  note_type: z.enum(['progress', 'admission', 'discharge', 'consultation', 'procedure', 'other'])
    .default('progress'),
  subject: z.string()
    .trim()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  content: z.string()
    .trim()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5000 characters'),
  is_confidential: z.boolean()
    .default(false),
});

export type PatientNoteFormData = z.infer<typeof patientNoteSchema>;

// Procedure Validation Schema
export const procedureSchema = z.object({
  procedure_name: z.string()
    .trim()
    .min(1, 'Procedure name is required')
    .max(300, 'Procedure name must be less than 300 characters'),
  performed_at: z.string()
    .min(1, 'Procedure date is required'),
  performed_by: z.string()
    .max(200, 'Performer name must be less than 200 characters')
    .optional()
    .nullable(),
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .nullable(),
});

export type ProcedureFormData = z.infer<typeof procedureSchema>;

// Consultation Validation Schema
export const consultationSchema = z.object({
  consultation_type: z.string()
    .trim()
    .min(1, 'Consultation type is required')
    .max(200, 'Consultation type must be less than 200 characters'),
  consultant_name: z.string()
    .trim()
    .min(1, 'Consultant name is required')
    .max(200, 'Consultant name must be less than 200 characters'),
  consultation_date: z.string()
    .min(1, 'Consultation date is required'),
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .nullable(),
});

export type ConsultationFormData = z.infer<typeof consultationSchema>;

// Helper function to validate form data
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors };
}
