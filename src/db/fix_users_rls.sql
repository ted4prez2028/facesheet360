
-- Create better Row Level Security (RLS) policies for the users table
-- to fix the "infinite recursion detected" error

-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Clear any problematic policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create a policy allowing users to view all profiles without recursion
CREATE POLICY "Allow users to view all profiles"
ON public.users
FOR SELECT
USING (true);

-- Create a policy allowing users to update their own profile only
CREATE POLICY "Allow users to update own profile"
ON public.users
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
