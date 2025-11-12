-- ============================================
-- PHASES 3-6: MAINNET DEPLOYMENT TO FULL LAUNCH
-- ============================================

-- ============================================
-- PHASE 3: MAINNET DEPLOYMENT TRACKING
-- ============================================

-- Track mainnet deployment status
CREATE TABLE IF NOT EXISTS public.carecoin_deployment_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_phase TEXT NOT NULL, -- 'testnet', 'mainnet', 'liquidity_added', 'verified'
  contract_address TEXT,
  network TEXT NOT NULL,
  deployer_address TEXT NOT NULL,
  transaction_hash TEXT,
  gas_used NUMERIC,
  deployment_cost_matic NUMERIC,
  liquidity_pool_address TEXT,
  liquidity_amount_care NUMERIC,
  liquidity_amount_usdc NUMERIC,
  liquidity_locked_until TIMESTAMP WITH TIME ZONE,
  polygonscan_verified BOOLEAN DEFAULT false,
  verification_url TEXT,
  deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deployed_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
  error_message TEXT,
  metadata JSONB
);

ALTER TABLE public.carecoin_deployment_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage deployment status" 
ON public.carecoin_deployment_status 
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_deployment_status_phase 
ON public.carecoin_deployment_status(deployment_phase, deployed_at DESC);

-- Track gas costs and wallet balance
CREATE TABLE IF NOT EXISTS public.gas_wallet_monitoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL,
  matic_balance NUMERIC NOT NULL,
  threshold_matic NUMERIC NOT NULL DEFAULT 100,
  last_refill_amount NUMERIC,
  last_refill_at TIMESTAMP WITH TIME ZONE,
  total_gas_spent NUMERIC DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  alert_sent BOOLEAN DEFAULT false,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gas_wallet_monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view gas monitoring" 
ON public.gas_wallet_monitoring 
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_gas_wallet_balance 
ON public.gas_wallet_monitoring(wallet_address, checked_at DESC);

-- ============================================
-- PHASE 4: LEGAL COMPLIANCE & KYC
-- ============================================

-- KYC verification tracking
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_provider TEXT NOT NULL, -- 'sumsub', 'persona', 'manual'
  verification_id TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_review', 'approved', 'rejected', 'expired'
  verification_level TEXT, -- 'basic', 'enhanced', 'full'
  identity_verified BOOLEAN DEFAULT false,
  address_verified BOOLEAN DEFAULT false,
  document_type TEXT,
  document_number TEXT,
  document_expiry DATE,
  country_code TEXT,
  date_of_birth DATE,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, verification_provider)
);

ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own KYC" 
ON public.kyc_verifications 
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can submit KYC" 
ON public.kyc_verifications 
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update KYC" 
ON public.kyc_verifications 
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_kyc_user_status 
ON public.kyc_verifications(user_id, verification_status);

-- Tax reporting (1099 generation)
CREATE TABLE IF NOT EXISTS public.tax_reporting (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  tax_year INTEGER NOT NULL,
  total_carecoin_earned NUMERIC NOT NULL DEFAULT 0,
  total_usd_value NUMERIC NOT NULL DEFAULT 0,
  total_cashouts NUMERIC NOT NULL DEFAULT 0,
  total_cashout_usd NUMERIC NOT NULL DEFAULT 0,
  form_1099_generated BOOLEAN DEFAULT false,
  form_1099_url TEXT,
  form_1099_sent BOOLEAN DEFAULT false,
  form_1099_sent_at TIMESTAMP WITH TIME ZONE,
  taxpayer_id_type TEXT, -- 'ssn', 'ein', 'itin'
  taxpayer_id_last_4 TEXT,
  mailing_address JSONB,
  generated_at TIMESTAMP WITH TIME ZONE,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tax_year)
);

ALTER TABLE public.tax_reporting ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax reports" 
ON public.tax_reporting 
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage tax reports" 
ON public.tax_reporting 
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_tax_reporting_year 
ON public.tax_reporting(tax_year, user_id);

-- Terms of Service acceptance tracking
CREATE TABLE IF NOT EXISTS public.terms_acceptances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_type TEXT NOT NULL, -- 'general', 'carecoin', 'privacy', 'hipaa'
  terms_version TEXT NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  acceptance_method TEXT, -- 'signup', 'update', 'required'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own acceptances" 
ON public.terms_acceptances 
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can record acceptances" 
ON public.terms_acceptances 
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_terms_user_type 
ON public.terms_acceptances(user_id, terms_type, accepted_at DESC);

-- Legal disclaimer acknowledgments
CREATE TABLE IF NOT EXISTS public.legal_disclaimers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  disclaimer_type TEXT NOT NULL, -- 'carecoin_risk', 'tax_liability', 'no_financial_advice', 'hipaa_crypto'
  disclaimer_title TEXT NOT NULL,
  disclaimer_content TEXT NOT NULL,
  version TEXT NOT NULL,
  effective_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  requires_acceptance BOOLEAN DEFAULT true,
  display_frequency TEXT DEFAULT 'once', -- 'once', 'session', 'always'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_disclaimers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active disclaimers" 
ON public.legal_disclaimers 
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage disclaimers" 
ON public.legal_disclaimers 
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- PHASE 5: SOFT LAUNCH / BETA TESTING
-- ============================================

-- Beta tester program
CREATE TABLE IF NOT EXISTS public.beta_testers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beta_group TEXT NOT NULL, -- 'carecoin_phase1', 'carecoin_phase2', 'full_access'
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'invited', -- 'invited', 'active', 'completed', 'removed'
  features_enabled TEXT[] DEFAULT ARRAY[]::TEXT[],
  transaction_limit INTEGER, -- Max CareCoin transactions during beta
  transactions_used INTEGER DEFAULT 0,
  feedback_provided BOOLEAN DEFAULT false,
  removed_at TIMESTAMP WITH TIME ZONE,
  removal_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, beta_group)
);

ALTER TABLE public.beta_testers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own beta status" 
ON public.beta_testers 
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage beta testers" 
ON public.beta_testers 
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_beta_group_status 
ON public.beta_testers(beta_group, status);

-- User feedback collection
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  feedback_type TEXT NOT NULL, -- 'bug', 'feature_request', 'carecoin', 'general', 'beta'
  feedback_category TEXT, -- 'wallet', 'minting', 'cashout', 'ui', 'performance'
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT, -- 'low', 'medium', 'high', 'critical'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed', 'wont_fix'
  priority INTEGER DEFAULT 5,
  attachments JSONB,
  browser_info JSONB,
  assigned_to UUID REFERENCES auth.users(id),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create feedback" 
ON public.user_feedback 
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own feedback" 
ON public.user_feedback 
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage feedback" 
ON public.user_feedback 
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_feedback_status_priority 
ON public.user_feedback(status, priority, created_at DESC);

-- Transaction monitoring alerts
CREATE TABLE IF NOT EXISTS public.transaction_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- 'suspicious_activity', 'high_volume', 'failed_mint', 'rate_limit', 'gas_spike'
  severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
  alert_message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  transaction_id UUID,
  transaction_hash TEXT,
  alert_details JSONB,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transaction_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all alerts" 
ON public.transaction_alerts 
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create alerts" 
ON public.transaction_alerts 
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update alerts" 
ON public.transaction_alerts 
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_alerts_severity_status 
ON public.transaction_alerts(severity, acknowledged, created_at DESC);

-- ============================================
-- PHASE 6: FULL LAUNCH
-- ============================================

-- Feature flags for gradual rollout
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL UNIQUE,
  feature_description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0, -- 0-100
  enabled_for_roles TEXT[], -- ['admin', 'beta', 'all']
  enabled_for_users UUID[],
  requirements JSONB, -- e.g., {"kyc_verified": true, "min_balance": 100}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  enabled_at TIMESTAMP WITH TIME ZONE,
  enabled_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feature flags" 
ON public.feature_flags 
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage feature flags" 
ON public.feature_flags 
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- User onboarding/education tracking
CREATE TABLE IF NOT EXISTS public.user_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_type TEXT NOT NULL, -- 'carecoin_intro', 'wallet_setup', 'first_mint', 'first_cashout'
  step_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  skipped BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, onboarding_type, step_name)
);

ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own onboarding" 
ON public.user_onboarding 
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_onboarding_user_type 
ON public.user_onboarding(user_id, onboarding_type, completed);

-- Support tickets for crypto issues
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL, -- 'wallet', 'minting', 'cashout', 'technical', 'account', 'other'
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'waiting_user', 'resolved', 'closed'
  assigned_to UUID REFERENCES auth.users(id),
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  satisfaction_rating INTEGER, -- 1-5
  satisfaction_comment TEXT,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create tickets" 
ON public.support_tickets 
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own tickets" 
ON public.support_tickets 
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR assigned_to = auth.uid());

CREATE POLICY "Support staff can update tickets" 
ON public.support_tickets 
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR assigned_to = auth.uid());

CREATE INDEX IF NOT EXISTS idx_tickets_status_priority 
ON public.support_tickets(status, priority, created_at DESC);

-- Generate ticket numbers automatically
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
BEGIN
  SELECT 'TICK-' || LPAD(NEXTVAL('ticket_number_seq')::TEXT, 6, '0') INTO new_number;
  RETURN new_number;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 100000;

-- Support ticket messages
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ticket messages" 
ON public.support_messages 
FOR SELECT
TO authenticated
USING (
  (is_internal = false AND EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE id = ticket_id AND user_id = auth.uid()
  )) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can create ticket messages" 
ON public.support_messages 
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE id = ticket_id AND user_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket 
ON public.support_messages(ticket_id, created_at);