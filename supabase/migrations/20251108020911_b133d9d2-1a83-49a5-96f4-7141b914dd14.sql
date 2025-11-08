-- Add missing fields to profiles table for user data
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS care_coins_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS specialty TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS online_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_online_status ON public.profiles(online_status);

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Users can view care coins balance" ON public.profiles;

CREATE POLICY "Users can view care coins balance"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);