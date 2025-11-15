
-- Drop ALL audit-related triggers and functions completely
-- This will ensure no audit code interferes with patient updates

-- Drop any remaining triggers on patients table
DROP TRIGGER IF EXISTS patients_audit_trigger ON public.patients CASCADE;
DROP TRIGGER IF EXISTS audit_patients_changes ON public.patients CASCADE;
DROP TRIGGER IF EXISTS audit_patients_trigger ON public.patients CASCADE;

-- Drop all audit functions
DROP FUNCTION IF EXISTS public.audit_patients_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.log_patients_audit() CASCADE;
DROP FUNCTION IF EXISTS public.log_audit_event() CASCADE;

-- Verify patients table structure
COMMENT ON TABLE public.patients IS 'Patients table - no patient_id column, only id column';
