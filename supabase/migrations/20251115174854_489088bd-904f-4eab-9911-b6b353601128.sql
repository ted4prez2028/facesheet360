
-- Temporarily disable the audit trigger to test if it's the cause
ALTER TABLE public.patients DISABLE TRIGGER patients_audit_trigger;
