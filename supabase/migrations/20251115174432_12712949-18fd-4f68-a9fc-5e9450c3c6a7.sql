
-- First, drop ALL audit triggers and functions to start clean
DROP TRIGGER IF EXISTS audit_patients_changes ON public.patients CASCADE;
DROP TRIGGER IF EXISTS audit_appointments ON public.appointments CASCADE;
DROP TRIGGER IF EXISTS audit_discharge_summaries ON public.discharge_summaries CASCADE;

DROP FUNCTION IF EXISTS public.log_patients_audit() CASCADE;
DROP FUNCTION IF EXISTS public.log_audit_event() CASCADE;

-- Create a clean, simple audit function for patients only
CREATE OR REPLACE FUNCTION public.audit_patients_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert audit log using the appropriate record
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      event_type,
      user_id,
      patient_id,
      resource_id
    ) VALUES (
      'patients_delete',
      auth.uid(),
      OLD.id,
      OLD.id::TEXT
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      event_type,
      user_id,
      patient_id,
      resource_id
    ) VALUES (
      'patients_update',
      auth.uid(),
      NEW.id,
      NEW.id::TEXT
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      event_type,
      user_id,
      patient_id,
      resource_id
    ) VALUES (
      'patients_create',
      auth.uid(),
      NEW.id,
      NEW.id::TEXT
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create the trigger
CREATE TRIGGER patients_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_patients_trigger();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.audit_patients_trigger() TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_patients_trigger() TO service_role;
