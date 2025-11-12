-- Fix audit trigger to handle patients table correctly
CREATE OR REPLACE FUNCTION public.log_patient_data_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  changes JSONB;
  resolved_patient_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Determine patient_id based on table and operation
  IF TG_TABLE_NAME = 'patients' THEN
    -- For patients table, use the id field as patient_id
    IF TG_OP = 'DELETE' THEN
      resolved_patient_id := OLD.id;
    ELSE
      resolved_patient_id := NEW.id;
    END IF;
  ELSE
    -- For other tables, try to get patient_id field
    IF TG_OP = 'DELETE' THEN
      resolved_patient_id := OLD.patient_id;
    ELSE
      resolved_patient_id := NEW.patient_id;
    END IF;
  END IF;
  
  -- Build changes object based on operation type
  IF TG_OP = 'DELETE' THEN
    changes := jsonb_build_object(
      'operation', 'DELETE',
      'table', TG_TABLE_NAME,
      'old_values', row_to_json(OLD)
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
      )
    );
  ELSIF TG_OP = 'INSERT' THEN
    changes := jsonb_build_object(
      'operation', 'INSERT',
      'table', TG_TABLE_NAME,
      'new_values', row_to_json(NEW)
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
    TG_TABLE_NAME || '_' || LOWER(TG_OP),
    changes,
    now()
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;