-- Create table to track pharmacy analysis runs
CREATE TABLE IF NOT EXISTS public.pharmacy_analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_insights INTEGER NOT NULL DEFAULT 0,
  safety_alerts INTEGER NOT NULL DEFAULT 0,
  refill_predictions INTEGER NOT NULL DEFAULT 0,
  adherence_issues INTEGER NOT NULL DEFAULT 0,
  emails_sent INTEGER NOT NULL DEFAULT 0,
  run_type TEXT NOT NULL DEFAULT 'manual', -- 'manual' or 'automated'
  triggered_by UUID REFERENCES auth.users(id),
  insights_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pharmacy_analysis_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pharmacy_analysis_history
CREATE POLICY "Healthcare staff can view analysis history"
ON public.pharmacy_analysis_history
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'pharmacist'::app_role) OR 
  has_role(auth.uid(), 'doctor'::app_role)
);

CREATE POLICY "System can insert analysis history"
ON public.pharmacy_analysis_history
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.pharmacy_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  safety_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  safety_alerts_min_priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  refill_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  refill_alerts_min_urgency TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  adherence_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  inventory_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  cost_savings_alerts_enabled BOOLEAN NOT NULL DEFAULT false,
  daily_summary_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.pharmacy_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification preferences
CREATE POLICY "Users can view own notification preferences"
ON public.pharmacy_notification_preferences
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification preferences"
ON public.pharmacy_notification_preferences
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences"
ON public.pharmacy_notification_preferences
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pharmacy_analysis_history_date ON public.pharmacy_analysis_history(analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_pharmacy_notification_preferences_user ON public.pharmacy_notification_preferences(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_pharmacy_notification_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for updating timestamp
CREATE TRIGGER update_pharmacy_notification_preferences_updated_at
BEFORE UPDATE ON public.pharmacy_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_pharmacy_notification_preferences_updated_at();