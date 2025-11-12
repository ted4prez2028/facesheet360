-- Create a function to handle CareCoin distribution for any table operation
CREATE OR REPLACE FUNCTION distribute_carecoins_on_data_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  provider_user_id UUID;
  patient_user_id UUID;
  operation_type TEXT;
  chart_type_name TEXT;
BEGIN
  -- Determine operation type
  IF TG_OP = 'INSERT' THEN
    operation_type := 'data_creation';
    chart_type_name := TG_TABLE_NAME || '_insert';
  ELSIF TG_OP = 'UPDATE' THEN
    operation_type := 'data_update';
    chart_type_name := TG_TABLE_NAME || '_update';
  ELSIF TG_OP = 'DELETE' THEN
    operation_type := 'data_deletion';
    chart_type_name := TG_TABLE_NAME || '_delete';
  END IF;

  -- Get provider user ID (person making the change)
  provider_user_id := auth.uid();
  
  -- If no authenticated user, skip (system operations)
  IF provider_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get patient user ID from the record
  IF TG_OP = 'DELETE' THEN
    -- For deletions, use OLD record
    IF TG_TABLE_NAME IN ('patient_vitals', 'medication_orders', 'lab_results', 'wound_assessments', 
                         'patient_notes', 'allergies', 'immunizations', 'procedures', 'consultations',
                         'advanced_directives', 'evaluations', 'care_plans', 'discharge_plans', 
                         'medical_diagnoses', 'discharge_summaries') THEN
      SELECT user_id INTO patient_user_id 
      FROM patients 
      WHERE id = OLD.patient_id;
    END IF;
  ELSE
    -- For inserts/updates, use NEW record
    IF TG_TABLE_NAME IN ('patient_vitals', 'medication_orders', 'lab_results', 'wound_assessments', 
                         'patient_notes', 'allergies', 'immunizations', 'procedures', 'consultations',
                         'advanced_directives', 'evaluations', 'care_plans', 'discharge_plans', 
                         'medical_diagnoses', 'discharge_summaries') THEN
      SELECT user_id INTO patient_user_id 
      FROM patients 
      WHERE id = NEW.patient_id;
    END IF;
  END IF;

  -- Create charting profit record (this will trigger edge function via app)
  INSERT INTO charting_profits (
    patient_id,
    provider_id,
    chart_type,
    chart_record_id,
    total_amount,
    patient_share,
    provider_share,
    admin_share,
    status
  ) VALUES (
    COALESCE(NEW.patient_id, OLD.patient_id),
    provider_user_id,
    chart_type_name,
    COALESCE(NEW.id, OLD.id),
    100,
    40,
    50,
    10,
    'pending'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON patient_vitals;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON medication_orders;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON allergies;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON patient_notes;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON lab_results;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON wound_assessments;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON immunizations;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON procedures;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON consultations;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON advanced_directives;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON evaluations;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON care_plans;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON discharge_plans;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON medical_diagnoses;
DROP TRIGGER IF EXISTS carecoin_distribution_trigger ON discharge_summaries;

-- Create triggers on all patient-related tables for INSERT, UPDATE, DELETE
CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON patient_vitals
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON medication_orders
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON allergies
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON patient_notes
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON lab_results
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON wound_assessments
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON immunizations
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON procedures
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON consultations
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON advanced_directives
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON evaluations
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON care_plans
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON discharge_plans
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON medical_diagnoses
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();

CREATE TRIGGER carecoin_distribution_trigger
AFTER INSERT OR UPDATE OR DELETE ON discharge_summaries
FOR EACH ROW
EXECUTE FUNCTION distribute_carecoins_on_data_change();