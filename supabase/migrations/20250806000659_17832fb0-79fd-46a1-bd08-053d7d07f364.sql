-- Add business growth improvements tracking to metrics
ALTER TABLE public.app_evolution_metrics 
ADD COLUMN business_growth_improvements INTEGER DEFAULT 0;

-- Create provider outreach logging table
CREATE TABLE public.provider_outreach_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_email TEXT NOT NULL,
  provider_name TEXT,
  campaign_type TEXT NOT NULL,
  status TEXT NOT NULL, -- 'trial_created', 'email_sent', 'failed', 'converted'
  account_id UUID,
  trial_expires_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outreach campaigns tracking table
CREATE TABLE public.outreach_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_type TEXT NOT NULL,
  providers_discovered INTEGER DEFAULT 0,
  providers_contacted INTEGER DEFAULT 0,
  accounts_created INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  improvement_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketing consent table (CRITICAL for compliance)
CREATE TABLE public.marketing_consent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  consented BOOLEAN NOT NULL DEFAULT false,
  consent_source TEXT, -- 'website_signup', 'conference', 'referral', etc.
  consent_date TIMESTAMP WITH TIME ZONE,
  unsubscribed BOOLEAN DEFAULT false,
  unsubscribe_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trial tracking to users table
ALTER TABLE public.users 
ADD COLUMN is_trial BOOLEAN DEFAULT false,
ADD COLUMN trial_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN trial_converted BOOLEAN DEFAULT false,
ADD COLUMN specialty TEXT,
ADD COLUMN organization TEXT;

-- Enable RLS on new tables
ALTER TABLE public.provider_outreach_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_consent ENABLE ROW LEVEL SECURITY;

-- Create policies for outreach tables (admin only)
CREATE POLICY "Admins can manage outreach logs" 
ON public.provider_outreach_log 
FOR ALL
USING (auth.uid() IS NOT NULL AND (
  SELECT role FROM public.users WHERE id = auth.uid()
) = 'admin');

CREATE POLICY "Admins can view outreach campaigns" 
ON public.outreach_campaigns 
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage outreach campaigns" 
ON public.outreach_campaigns 
FOR ALL
USING (true);

CREATE POLICY "Users can manage their marketing consent" 
ON public.marketing_consent 
FOR ALL
USING (true); -- Allow public access for consent management

-- Add updated_at triggers
CREATE TRIGGER update_outreach_log_updated_at
BEFORE UPDATE ON public.provider_outreach_log
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_consent_updated_at
BEFORE UPDATE ON public.marketing_consent
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();