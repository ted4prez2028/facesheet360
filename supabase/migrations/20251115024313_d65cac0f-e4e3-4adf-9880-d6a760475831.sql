-- Fix all functions to have proper search_path set

-- Fix update_driver_rating_stats
CREATE OR REPLACE FUNCTION public.update_driver_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_avg_rating NUMERIC;
  v_total_ratings INTEGER;
BEGIN
  -- Calculate new average rating and total count
  SELECT AVG(rating)::NUMERIC(3,2), COUNT(*)
  INTO v_avg_rating, v_total_ratings
  FROM driver_ratings
  WHERE driver_id = NEW.driver_id;
  
  -- Update driver record
  UPDATE drivers
  SET 
    rating = v_avg_rating,
    total_ratings = v_total_ratings,
    updated_at = now()
  WHERE id = NEW.driver_id;
  
  RETURN NEW;
END;
$$;

-- Fix calculate_distance
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  R CONSTANT NUMERIC := 6371; -- Earth radius in kilometers
  dLat NUMERIC;
  dLon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  a := sin(dLat/2) * sin(dLat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dLon/2) * sin(dLon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN R * c;
END;
$$;

-- Fix increment_balance
CREATE OR REPLACE FUNCTION public.increment_balance(p_user_id uuid, p_amount numeric)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE profiles
  SET care_coins_balance = care_coins_balance + p_amount
  WHERE id = p_user_id;
END;
$$;

-- Fix log_audit_event
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Fix text-based has_role (keep both versions as they may be in use)
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = has_role.user_id
      AND user_roles.role = role_name
  );
END;
$$;

-- Fix text array-based has_any_role (keep both versions as they may be in use)
CREATE OR REPLACE FUNCTION public.has_any_role(user_id uuid, role_names text[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = has_any_role.user_id
      AND user_roles.role = ANY(role_names)
  );
END;
$$;

-- Fix get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_roles.user_id = get_user_role.user_id
  LIMIT 1;
  
  RETURN user_role;
END;
$$;