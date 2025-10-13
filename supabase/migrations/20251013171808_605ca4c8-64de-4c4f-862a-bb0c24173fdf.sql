-- Enable RLS on tables missing it (CRITICAL SECURITY FIX)
ALTER TABLE IF EXISTS public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for error_logs
CREATE POLICY "Admins can view error logs"
  ON public.error_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert error logs"
  ON public.error_logs
  FOR INSERT
  WITH CHECK (true);

-- Add RLS policies for auth_attempts
CREATE POLICY "System can insert auth attempts"
  ON public.auth_attempts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view auth attempts"
  ON public.auth_attempts
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policies for notification_logs
CREATE POLICY "Admins can view notification logs"
  ON public.notification_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policies for credit_packages
CREATE POLICY "Everyone can view active credit packages"
  ON public.credit_packages
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage credit packages"
  ON public.credit_packages
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));