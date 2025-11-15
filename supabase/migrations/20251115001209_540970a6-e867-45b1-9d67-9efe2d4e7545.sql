-- Re-enable HIPAA audit logging triggers for confirmed existing patient tables

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS audit_patients_changes ON patients;
DROP TRIGGER IF EXISTS audit_allergies_changes ON allergies;
DROP TRIGGER IF EXISTS audit_appointments_changes ON appointments;
DROP TRIGGER IF EXISTS audit_consultations_changes ON consultations;
DROP TRIGGER IF EXISTS audit_care_plans_changes ON care_plans;
DROP TRIGGER IF EXISTS audit_discharge_plans_changes ON discharge_plans;
DROP TRIGGER IF EXISTS audit_advanced_directives_changes ON advanced_directives;
DROP TRIGGER IF EXISTS audit_evaluations_changes ON evaluations;
DROP TRIGGER IF EXISTS audit_messages_changes ON messages;
DROP TRIGGER IF EXISTS audit_clinical_alerts_changes ON clinical_alerts;

-- Create triggers for automatic audit logging on all patient data access/modifications
CREATE TRIGGER audit_patients_changes
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_allergies_changes
  AFTER INSERT OR UPDATE OR DELETE ON allergies
  FOR EACH ROW EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_appointments_changes
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_consultations_changes
  AFTER INSERT OR UPDATE OR DELETE ON consultations
  FOR EACH ROW EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_care_plans_changes
  AFTER INSERT OR UPDATE OR DELETE ON care_plans
  FOR EACH ROW EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_discharge_plans_changes
  AFTER INSERT OR UPDATE OR DELETE ON discharge_plans
  FOR EACH ROW EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_advanced_directives_changes
  AFTER INSERT OR UPDATE OR DELETE ON advanced_directives
  FOR EACH ROW EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_evaluations_changes
  AFTER INSERT OR UPDATE OR DELETE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_messages_changes
  AFTER INSERT OR UPDATE OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_clinical_alerts_changes
  AFTER INSERT OR UPDATE OR DELETE ON clinical_alerts
  FOR EACH ROW EXECUTE FUNCTION log_patient_data_audit();