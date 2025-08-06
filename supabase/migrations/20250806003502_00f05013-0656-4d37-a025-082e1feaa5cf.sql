-- Create admin roles and RLS policies for AI functionality

-- First, ensure we have the app_role enum with admin
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'nurse', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Function to automatically assign admin role to specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'doctor')
  );
  
  -- Assign admin role to specific email
  IF NEW.email = 'tdicusmurray@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update RLS policies for AI tables to be admin-only
DROP POLICY IF EXISTS "Anyone can view AI improvements" ON public.ai_improvements;
DROP POLICY IF EXISTS "System can manage AI improvements" ON public.ai_improvements;
DROP POLICY IF EXISTS "Anyone can view evolution metrics" ON public.app_evolution_metrics;
DROP POLICY IF EXISTS "System can manage evolution metrics" ON public.app_evolution_metrics;

-- Create admin-only policies for AI improvements
CREATE POLICY "Admins can view AI improvements"
ON public.ai_improvements
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage AI improvements"
ON public.ai_improvements
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create admin-only policies for evolution metrics
CREATE POLICY "Admins can view evolution metrics"
ON public.app_evolution_metrics
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage evolution metrics"
ON public.app_evolution_metrics
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;