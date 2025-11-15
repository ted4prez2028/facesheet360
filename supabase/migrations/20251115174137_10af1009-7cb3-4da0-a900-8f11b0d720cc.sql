
-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS audit_patients_changes ON public.patients;
DROP FUNCTION IF EXISTS public.log_patient_data_audit() CASCADE;

-- Create a new, simpler audit function specifically for the patients table
CREATE OR REPLACE FUNCTION public.log_patients_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_type_str TEXT;
  patient_id_value UUID;
  resource_id_value TEXT;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event_type_str := 'patients_create';
    patient_id_value := NEW.id;
    resource_id_value := NEW.id::TEXT;
  ELSIF TG_OP = 'UPDATE' THEN
    event_type_str := 'patients_update';
    patient_id_value := NEW.id;
    resource_id_value := NEW.id::TEXT;
  ELSIF TG_OP = 'DELETE' THEN
    event_type_str := 'patients_delete';
    patient_id_value := OLD.id;
    resource_id_value := OLD.id::TEXT;
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_logs (
    event_type,
    user_id,
    patient_id,
    resource_id
  ) VALUES (
    event_type_str,
    auth.uid(),
    patient_id_value,
    resource_id_value
  );

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create the trigger using the new function
CREATE TRIGGER audit_patients_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.log_patients_audit();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.log_patients_audit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_patients_audit() TO service_role;
