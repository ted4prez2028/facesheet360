
-- Force a complete refresh by dropping and recreating EVERYTHING related to patients table triggers
-- This should clear any cached query plans

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients CASCADE;
DROP FUNCTION IF EXISTS public.update_patients_updated_at() CASCADE;

-- Recreate with a completely new name to force cache invalidation
CREATE OR REPLACE FUNCTION public.patients_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Create the trigger with the new function
CREATE TRIGGER patients_update_timestamp
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.patients_set_updated_at();

-- Force PostgreSQL to invalidate query plans
DISCARD PLANS;
