-- Fix the audit function to properly handle patient_id extraction
DROP TRIGGER IF EXISTS audit_patients_changes ON public.patients;

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
  old_json JSONB;
  new_json JSONB;
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
  
  -- Convert records to JSON for easier field access
  IF TG_OP = 'DELETE' THEN
    old_json := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    old_json := to_jsonb(OLD);
    new_json := to_jsonb(NEW);
  ELSE
    new_json := to_jsonb(NEW);
  END IF;
  
  -- Determine patient_id based on table
  IF TG_TABLE_NAME = 'patients' THEN
    -- For patients table, use the id field as patient_id
    IF TG_OP = 'DELETE' THEN
      resolved_patient_id := OLD.id;
    ELSE
      resolved_patient_id := NEW.id;
    END IF;
  ELSE
    -- For other tables, try to extract patient_id from JSON
    BEGIN
      IF TG_OP = 'DELETE' THEN
        resolved_patient_id := (old_json->>'patient_id')::UUID;
      ELSE
        resolved_patient_id := (new_json->>'patient_id')::UUID;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      resolved_patient_id := NULL;
    END;
  END IF;
  
  -- Determine event type
  event_type_value := TG_TABLE_NAME || '_' || LOWER(TG_OP);
  
  -- Build changes object based on operation type
  IF TG_OP = 'DELETE' THEN
    changes := jsonb_build_object(
      'operation', 'DELETE',
      'table', TG_TABLE_NAME,
      'old_values', old_json,
      'timestamp', now()
    );
  ELSIF TG_OP = 'UPDATE' THEN
    changes := jsonb_build_object(
      'operation', 'UPDATE',
      'table', TG_TABLE_NAME,
      'old_values', old_json,
      'new_values', new_json,
      'changed_fields', (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(new_json)
        WHERE new_json -> key IS DISTINCT FROM old_json -> key
      ),
      'timestamp', now()
    );
  ELSIF TG_OP = 'INSERT' THEN
    changes := jsonb_build_object(
      'operation', 'INSERT',
      'table', TG_TABLE_NAME,
      'new_values', new_json,
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
      WHEN TG_OP = 'DELETE' THEN (old_json->>'id')
      ELSE (new_json->>'id')
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

-- Recreate the trigger
CREATE TRIGGER audit_patients_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();