-- Drop duplicate audit triggers on patients table
DROP TRIGGER IF EXISTS audit_patients ON public.patients;
DROP TRIGGER IF EXISTS audit_patients_changes ON public.patients;

-- Recreate the audit function with better error handling
CREATE OR REPLACE FUNCTION public.log_patient_data_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID;
  changes JSONB;
  resolved_patient_id UUID;
  event_type_value TEXT;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Skip if no authenticated user (system operations)
  IF current_user_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;
  
  -- Determine patient_id based on table and operation
  BEGIN
    IF TG_TABLE_NAME = 'patients' THEN
      -- For patients table, use the id field as patient_id
      IF TG_OP = 'DELETE' THEN
        resolved_patient_id := OLD.id;
      ELSE
        resolved_patient_id := NEW.id;
      END IF;
    ELSE
      -- For other tables, try to get patient_id field if it exists
      IF TG_OP = 'DELETE' THEN
        EXECUTE format('SELECT ($1).patient_id') INTO resolved_patient_id USING OLD;
      ELSE
        EXECUTE format('SELECT ($1).patient_id') INTO resolved_patient_id USING NEW;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- If patient_id doesn't exist in the record, set to NULL
    resolved_patient_id := NULL;
  END;
  
  -- Determine event type
  event_type_value := TG_TABLE_NAME || '_' || LOWER(TG_OP);
  
  -- Build changes object based on operation type
  IF TG_OP = 'DELETE' THEN
    changes := jsonb_build_object(
      'operation', 'DELETE',
      'table', TG_TABLE_NAME,
      'old_values', row_to_json(OLD),
      'timestamp', now()
    );
  ELSIF TG_OP = 'UPDATE' THEN
    changes := jsonb_build_object(
      'operation', 'UPDATE',
      'table', TG_TABLE_NAME,
      'old_values', row_to_json(OLD),
      'new_values', row_to_json(NEW),
      'changed_fields', (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
      ),
      'timestamp', now()
    );
  ELSIF TG_OP = 'INSERT' THEN
    changes := jsonb_build_object(
      'operation', 'INSERT',
      'table', TG_TABLE_NAME,
      'new_values', row_to_json(NEW),
      'timestamp', now()
    );
  END IF;
  
  -- Insert audit log
  INSERT INTO public.audit_logs (
    user_id,
    patient_id,
    resource_id,
    event_type,
    action_details,
    created_at
  ) VALUES (
    current_user_id,
    resolved_patient_id,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
      ELSE NEW.id::TEXT
    END,
    event_type_value,
    changes,
    now()
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the operation
    RAISE WARNING 'Audit logging failed: %', SQLERRM;
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
END;
$$;

-- Recreate single audit trigger for patients table
CREATE TRIGGER audit_patients_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();