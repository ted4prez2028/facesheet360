-- Create function to automatically log audit trail for patient data changes
CREATE OR REPLACE FUNCTION public.log_patient_data_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  changes JSONB;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
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
    COALESCE(
      CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.patient_id::TEXT
        ELSE NEW.patient_id::TEXT
      END,
      CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
        ELSE NEW.id::TEXT
      END
    )::UUID,
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

-- Add audit triggers to sensitive patient data tables

-- Patients table
DROP TRIGGER IF EXISTS audit_patients_changes ON patients;
CREATE TRIGGER audit_patients_changes
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

-- Patient vitals
DROP TRIGGER IF EXISTS audit_patient_vitals_changes ON patient_vitals;
CREATE TRIGGER audit_patient_vitals_changes
  AFTER INSERT OR UPDATE OR DELETE ON patient_vitals
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

-- Medication orders
DROP TRIGGER IF EXISTS audit_medication_orders_changes ON medication_orders;
CREATE TRIGGER audit_medication_orders_changes
  AFTER INSERT OR UPDATE OR DELETE ON medication_orders
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

-- Medical diagnoses
DROP TRIGGER IF EXISTS audit_medical_diagnoses_changes ON medical_diagnoses;
CREATE TRIGGER audit_medical_diagnoses_changes
  AFTER INSERT OR UPDATE OR DELETE ON medical_diagnoses
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

-- Lab results
DROP TRIGGER IF EXISTS audit_lab_results_changes ON lab_results;
CREATE TRIGGER audit_lab_results_changes
  AFTER INSERT OR UPDATE OR DELETE ON lab_results
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

-- Imaging studies
DROP TRIGGER IF EXISTS audit_imaging_studies_changes ON imaging_studies;
CREATE TRIGGER audit_imaging_studies_changes
  AFTER INSERT OR UPDATE OR DELETE ON imaging_studies
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

-- Allergies
DROP TRIGGER IF EXISTS audit_allergies_changes ON allergies;
CREATE TRIGGER audit_allergies_changes
  AFTER INSERT OR UPDATE OR DELETE ON allergies
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

-- Immunizations
DROP TRIGGER IF EXISTS audit_immunizations_changes ON immunizations;
CREATE TRIGGER audit_immunizations_changes
  AFTER INSERT OR UPDATE OR DELETE ON immunizations
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

-- Medication administration records
DROP TRIGGER IF EXISTS audit_medication_administration_records_changes ON medication_administration_records;
CREATE TRIGGER audit_medication_administration_records_changes
  AFTER INSERT OR UPDATE OR DELETE ON medication_administration_records
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

-- Care plans
DROP TRIGGER IF EXISTS audit_care_plans_changes ON care_plans;
CREATE TRIGGER audit_care_plans_changes
  AFTER INSERT OR UPDATE OR DELETE ON care_plans
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

-- Advanced directives
DROP TRIGGER IF EXISTS audit_advanced_directives_changes ON advanced_directives;
CREATE TRIGGER audit_advanced_directives_changes
  AFTER INSERT OR UPDATE OR DELETE ON advanced_directives
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

-- Create index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_patient_id_created_at ON audit_logs(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_created_at ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);

-- Create view for easy audit log reading
CREATE OR REPLACE VIEW patient_audit_trail AS
SELECT 
  al.id,
  al.created_at,
  al.event_type,
  al.action_details,
  al.patient_id,
  p.name as patient_name,
  al.user_id,
  pr.name as user_name,
  pr.role as user_role
FROM audit_logs al
LEFT JOIN patients p ON al.patient_id = p.id
LEFT JOIN profiles pr ON al.user_id = pr.id
ORDER BY al.created_at DESC;