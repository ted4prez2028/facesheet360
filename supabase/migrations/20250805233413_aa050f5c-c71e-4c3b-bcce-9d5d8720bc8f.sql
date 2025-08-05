-- Create system health metrics table
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  total_patients INTEGER DEFAULT 0,
  daily_appointments INTEGER DEFAULT 0,
  system_uptime INTERVAL,
  error_rate NUMERIC DEFAULT 0.0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create error logs table for tracking system errors
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  user_id UUID,
  session_id TEXT,
  endpoint TEXT,
  severity TEXT DEFAULT 'error',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create auth attempts table for security monitoring
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to analyze tables for performance optimization
CREATE OR REPLACE FUNCTION public.analyze_tables()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Analyze key tables to update statistics
  ANALYZE public.users;
  ANALYZE public.patients;
  ANALYZE public.appointments;
  ANALYZE public.notifications;
  ANALYZE public.care_coins_transactions;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Set up cron job to run maintenance every hour
SELECT cron.schedule(
  'system-maintenance-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://tuembzleutkexrmrzxkg.supabase.co/functions/v1/system-maintenance-cron',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZW1iemxldXRrZXhybXJ6eGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTcwMzksImV4cCI6MjA1ODU3MzAzOX0.nEy5OlfHeFFIFinnAbD2oYGsxnSuE-mTXqAGv98f1eE"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);