-- Drop and recreate helper functions for role-based access control
DROP FUNCTION IF EXISTS has_role(UUID, TEXT);
DROP FUNCTION IF EXISTS has_any_role(UUID, TEXT[]);
DROP FUNCTION IF EXISTS get_user_role(UUID);

CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION has_any_role(user_id UUID, role_names TEXT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Now fix RLS policies for patient_vitals to allow inserts by healthcare staff
DROP POLICY IF EXISTS "Healthcare staff can insert vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Healthcare staff can view vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Healthcare staff can update vitals" ON patient_vitals;

-- Allow healthcare staff to view all patient vitals
CREATE POLICY "Healthcare staff can view vitals"
ON patient_vitals FOR SELECT
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'cna', 'therapist']::text[])
);

-- Allow healthcare staff to insert patient vitals
CREATE POLICY "Healthcare staff can insert vitals"
ON patient_vitals FOR INSERT
TO authenticated
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'cna', 'therapist']::text[])
);

-- Allow healthcare staff to update patient vitals
CREATE POLICY "Healthcare staff can update vitals"
ON patient_vitals FOR UPDATE
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'cna', 'therapist']::text[])
);