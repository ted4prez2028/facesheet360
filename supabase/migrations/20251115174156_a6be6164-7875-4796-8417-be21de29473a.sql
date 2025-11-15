
-- Fix the log_audit_event function to handle tables without patient_id column
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_type_value TEXT;
  table_name_lower TEXT;
  patient_id_value TEXT;
  resource_id_value TEXT;
  old_data_json JSONB;
  new_data_json JSONB;
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
  
  -- Safely extract patient_id and resource_id based on operation
  IF TG_OP = 'DELETE' THEN
    old_data_json := to_jsonb(OLD);
    patient_id_value := CASE WHEN old_data_json ? 'patient_id' THEN old_data_json->>'patient_id' ELSE NULL END;
    resource_id_value := CASE WHEN old_data_json ? 'id' THEN old_data_json->>'id' ELSE NULL END;
    
    -- Log the event
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
      patient_id_value,
      resource_id_value,
      jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME, 'old_data', old_data_json),
      NULL,
      NULL
    );
  ELSE
    new_data_json := to_jsonb(NEW);
    patient_id_value := CASE WHEN new_data_json ? 'patient_id' THEN new_data_json->>'patient_id' ELSE NULL END;
    resource_id_value := CASE WHEN new_data_json ? 'id' THEN new_data_json->>'id' ELSE NULL END;
    
    -- Log the event
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
      patient_id_value,
      resource_id_value,
      jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME, 'new_data', new_data_json),
      NULL,
      NULL
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.log_audit_event() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event() TO service_role;
