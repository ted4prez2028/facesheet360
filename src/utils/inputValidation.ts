/**
 * HIPAA-Compliant Input Validation and Sanitization
 * Prevents injection attacks and ensures data integrity
 */

import { z } from 'zod';

// Email validation
export const emailSchema = z.string()
  .trim()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters');

// Phone validation (US format)
export const phoneSchema = z.string()
  .trim()
  .regex(/^[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number too long');

// Name validation (prevents script injection)
export const nameSchema = z.string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\-\.\']+$/, 'Name contains invalid characters');

// Medical Record Number validation
export const mrnSchema = z.string()
  .trim()
  .regex(/^[A-Z0-9\-]+$/, 'Invalid MRN format')
  .min(3, 'MRN too short')
  .max(20, 'MRN too long');

// Date validation
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

// Sanitize HTML to prevent XSS
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Sanitize SQL input (basic - use parameterized queries in production)
export const sanitizeSql = (input: string): string => {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
};

// Validate and sanitize text input
export const validateTextInput = (
  input: string,
  maxLength: number = 1000,
  allowSpecialChars: boolean = false
): { isValid: boolean; sanitized: string; error?: string } => {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { isValid: false, sanitized: '', error: 'Input cannot be empty' };
  }

  if (trimmed.length > maxLength) {
    return { 
      isValid: false, 
      sanitized: '', 
      error: `Input must be less than ${maxLength} characters` 
    };
  }

  if (!allowSpecialChars && /[<>{}]/.test(trimmed)) {
    return { 
      isValid: false, 
      sanitized: '', 
      error: 'Input contains invalid characters' 
    };
  }

  const sanitized = sanitizeHtml(trimmed);

  return { isValid: true, sanitized };
};

// Patient form validation schema
export const patientFormSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  date_of_birth: dateSchema,
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().trim().max(500).optional(),
  medical_record_number: mrnSchema.optional(),
  insurance_provider: z.string().trim().max(200).optional(),
  insurance_number: z.string().trim().max(100).optional(),
  emergency_contact_name: nameSchema.optional(),
  emergency_contact_phone: phoneSchema.optional(),
  emergency_contact_relation: z.string().trim().max(50).optional(),
});

// Appointment form validation schema
export const appointmentFormSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  appointment_date: z.string().min(1, 'Appointment date is required'),
  notes: z.string().trim().max(1000, 'Notes must be less than 1000 characters').optional(),
});

// Prescription validation schema
export const prescriptionFormSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  medication_name: z.string().trim().min(1).max(200, 'Medication name too long'),
  dosage: z.string().trim().min(1).max(50, 'Dosage too long'),
  frequency: z.string().trim().min(1).max(100, 'Frequency too long'),
  instructions: z.string().trim().max(1000).optional(),
  start_date: dateSchema,
  end_date: dateSchema.optional(),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;
export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;
export type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>;
