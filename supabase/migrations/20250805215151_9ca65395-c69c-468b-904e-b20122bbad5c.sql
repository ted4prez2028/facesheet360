-- Fix RLS policies for users table to use the correct id column
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create new policies using the id column (which matches auth.uid())
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can create their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (id = auth.uid());