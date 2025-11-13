-- Create audit logging trigger function
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  event_type_value TEXT;
  table_name_lower TEXT;
BEGIN
  table_name_lower := TG_TABLE_NAME;
  
  -- Determine event type based on operation and table
  IF TG_OP = 'INSERT' THEN
    event_type_value := table_name_lower || '_create';
  ELSIF TG_OP = 'UPDATE' THEN
    event_type_value := table_name_lower || '_update';
  ELSIF TG_OP = 'DELETE' THEN
    event_type_value := table_name_lower || '_delete';
  END IF;
  
  -- Log the event
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      event_type,
      user_id,
      patient_id,
      resource_id,
      action_details,
      ip_address,
      user_agent
    ) VALUES (
      event_type_value,
      auth.uid()::TEXT,
      CASE WHEN OLD.patient_id IS NOT NULL THEN OLD.patient_id::TEXT ELSE NULL END,
      CASE WHEN OLD.id IS NOT NULL THEN OLD.id::TEXT ELSE NULL END,
      jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME, 'old_data', row_to_json(OLD)),
      NULL,
      NULL
    );
  ELSE
    INSERT INTO audit_logs (
      event_type,
      user_id,
      patient_id,
      resource_id,
      action_details,
      ip_address,
      user_agent
    ) VALUES (
      event_type_value,
      auth.uid()::TEXT,
      CASE WHEN NEW.patient_id IS NOT NULL THEN NEW.patient_id::TEXT ELSE NULL END,
      CASE WHEN NEW.id IS NOT NULL THEN NEW.id::TEXT ELSE NULL END,
      jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME, 'new_data', row_to_json(NEW)),
      NULL,
      NULL
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to all patient-related tables
CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_patient_vitals AFTER INSERT OR UPDATE OR DELETE ON patient_vitals
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_medication_orders AFTER INSERT OR UPDATE OR DELETE ON medication_orders
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_patient_notes AFTER INSERT OR UPDATE OR DELETE ON patient_notes
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_lab_results AFTER INSERT OR UPDATE OR DELETE ON lab_results
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_wound_assessments AFTER INSERT OR UPDATE OR DELETE ON wound_assessments
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_allergies AFTER INSERT OR UPDATE OR DELETE ON allergies
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_immunizations AFTER INSERT OR UPDATE OR DELETE ON immunizations
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_procedures AFTER INSERT OR UPDATE OR DELETE ON procedures
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_consultations AFTER INSERT OR UPDATE OR DELETE ON consultations
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_discharge_summaries AFTER INSERT OR UPDATE OR DELETE ON discharge_summaries
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_medical_diagnoses AFTER INSERT OR UPDATE OR DELETE ON medical_diagnoses
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Add RLS policies for audit_logs if not exist
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
CREATE POLICY "Admins can view all audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_patient_id ON audit_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);