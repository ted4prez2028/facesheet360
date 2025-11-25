-- Fix RLS policies on patient_vitals table to handle app_role enum properly

-- Drop existing policies
DROP POLICY IF EXISTS "Healthcare staff can insert vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Healthcare staff can update vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Healthcare staff can view vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Healthcare staff can delete vitals" ON patient_vitals;

-- Recreate policies with proper type casting
CREATE POLICY "Healthcare staff can view vitals"
  ON patient_vitals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text IN ('admin', 'doctor', 'nurse', 'cna', 'therapist')
    )
  );

CREATE POLICY "Healthcare staff can insert vitals"
  ON patient_vitals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text IN ('admin', 'doctor', 'nurse', 'cna', 'therapist')
    )
  );

CREATE POLICY "Healthcare staff can update vitals"
  ON patient_vitals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text IN ('admin', 'doctor', 'nurse', 'cna', 'therapist')
    )
  );

CREATE POLICY "Healthcare staff can delete vitals"
  ON patient_vitals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text IN ('admin', 'doctor', 'nurse')
    )
  );