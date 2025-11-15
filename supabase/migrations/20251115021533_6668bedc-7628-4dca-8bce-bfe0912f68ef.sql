-- Drop existing audit_logs table
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- Create fresh audit_logs table with proper structure
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  resource_id TEXT,
  action_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_audit_logs_patient_id ON public.audit_logs(patient_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert audit logs
CREATE POLICY "Users can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can view all audit logs
CREATE POLICY "Users can view audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage all audit logs
CREATE POLICY "Admins can manage audit logs"
  ON public.audit_logs
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));