-- Remove foreign key constraint on patient_id for flexible audit logging
ALTER TABLE public.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_patient_id_fkey;