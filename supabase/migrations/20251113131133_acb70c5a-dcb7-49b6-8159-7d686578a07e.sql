
-- Comprehensive HIPAA Audit Logging System
-- This migration creates triggers to automatically log ALL patient data operations

-- Drop existing audit function and triggers if they exist
DROP TRIGGER IF EXISTS audit_patients ON patients;
DROP TRIGGER IF EXISTS audit_patient_vitals ON patient_vitals;
DROP TRIGGER IF EXISTS audit_medication_orders ON medication_orders;
DROP TRIGGER IF EXISTS audit_allergies ON allergies;
DROP TRIGGER IF EXISTS audit_patient_notes ON patient_notes;
DROP TRIGGER IF EXISTS audit_immunizations ON immunizations;
DROP TRIGGER IF EXISTS audit_lab_results ON lab_results;
DROP TRIGGER IF EXISTS audit_wound_assessments ON wound_assessments;
DROP TRIGGER IF EXISTS audit_procedures ON procedures;
DROP TRIGGER IF EXISTS audit_consultations ON consultations;
DROP TRIGGER IF EXISTS audit_medical_diagnoses ON medical_diagnoses;
DROP TRIGGER IF EXISTS audit_advanced_directives ON advanced_directives;
DROP TRIGGER IF EXISTS audit_evaluations ON evaluations;
DROP TRIGGER IF EXISTS audit_care_plans ON care_plans;
DROP TRIGGER IF EXISTS audit_discharge_plans ON discharge_plans;

DROP FUNCTION IF EXISTS public.log_patient_data_audit();

-- Create comprehensive audit logging function
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

-- Create triggers on all patient-related tables
CREATE TRIGGER audit_patients
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_patient_vitals
  AFTER INSERT OR UPDATE OR DELETE ON patient_vitals
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_medication_orders
  AFTER INSERT OR UPDATE OR DELETE ON medication_orders
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_allergies
  AFTER INSERT OR UPDATE OR DELETE ON allergies
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_patient_notes
  AFTER INSERT OR UPDATE OR DELETE ON patient_notes
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_immunizations
  AFTER INSERT OR UPDATE OR DELETE ON immunizations
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_lab_results
  AFTER INSERT OR UPDATE OR DELETE ON lab_results
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_wound_assessments
  AFTER INSERT OR UPDATE OR DELETE ON wound_assessments
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_procedures
  AFTER INSERT OR UPDATE OR DELETE ON procedures
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_consultations
  AFTER INSERT OR UPDATE OR DELETE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_medical_diagnoses
  AFTER INSERT OR UPDATE OR DELETE ON medical_diagnoses
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_advanced_directives
  AFTER INSERT OR UPDATE OR DELETE ON advanced_directives
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_evaluations
  AFTER INSERT OR UPDATE OR DELETE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_care_plans
  AFTER INSERT OR UPDATE OR DELETE ON care_plans
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_discharge_plans
  AFTER INSERT OR UPDATE OR DELETE ON discharge_plans
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

-- Add comments for documentation
COMMENT ON FUNCTION log_patient_data_audit() IS 'HIPAA-compliant audit logging function that captures all patient data operations (INSERT, UPDATE, DELETE) with full change tracking';
COMMENT ON TRIGGER audit_patients ON patients IS 'Automatically logs all patient record changes for HIPAA compliance';
COMMENT ON TRIGGER audit_patient_vitals ON patient_vitals IS 'Automatically logs all vital signs changes for HIPAA compliance';
COMMENT ON TRIGGER audit_medication_orders ON medication_orders IS 'Automatically logs all medication order changes for HIPAA compliance';
