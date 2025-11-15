-- Fix the audit trigger function to properly handle patients table
DROP FUNCTION IF EXISTS public.log_patient_data_audit() CASCADE;

CREATE OR REPLACE FUNCTION public.log_patient_data_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  resolved_patient_id UUID;
  resolved_resource_id TEXT;
  event_type_str TEXT;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event_type_str := TG_TABLE_NAME || '_create';
  ELSIF TG_OP = 'UPDATE' THEN
    event_type_str := TG_TABLE_NAME || '_update';
  ELSIF TG_OP = 'DELETE' THEN
    event_type_str := TG_TABLE_NAME || '_delete';
  END IF;

  -- Determine patient_id based on table
  IF TG_TABLE_NAME = 'patients' THEN
    -- For patients table, use id directly
    IF TG_OP = 'DELETE' THEN
      resolved_patient_id := OLD.id;
      resolved_resource_id := OLD.id::TEXT;
    ELSE
      resolved_patient_id := NEW.id;
      resolved_resource_id := NEW.id::TEXT;
    END IF;
  ELSE
    -- For other tables, use patient_id column
    BEGIN
      IF TG_OP = 'DELETE' THEN
        resolved_patient_id := OLD.patient_id;
        resolved_resource_id := OLD.id::TEXT;
      ELSE
        resolved_patient_id := NEW.patient_id;
        resolved_resource_id := NEW.id::TEXT;
      END IF;
    EXCEPTION
      WHEN undefined_column THEN
        resolved_patient_id := NULL;
        resolved_resource_id := NULL;
    END;
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
    resolved_patient_id,
    resolved_resource_id
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Recreate the trigger on patients table
DROP TRIGGER IF EXISTS audit_patients_changes ON public.patients;
CREATE TRIGGER audit_patients_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.log_patient_data_audit();