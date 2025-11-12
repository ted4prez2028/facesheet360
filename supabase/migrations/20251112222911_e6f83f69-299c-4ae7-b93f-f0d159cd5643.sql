-- =============================================
-- COMPREHENSIVE FACESHEET360 DATABASE SCHEMA
-- =============================================

-- =============================================
-- 1. CORE EHR TABLES
-- =============================================

-- Allergies
CREATE TABLE IF NOT EXISTS public.allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  allergen TEXT NOT NULL,
  reaction TEXT,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'life-threatening')),
  recorded_by UUID REFERENCES auth.users(id),
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view allergies" ON public.allergies
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'pharmacist'::app_role]));

CREATE POLICY "Healthcare staff can insert allergies" ON public.allergies
  FOR INSERT WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

CREATE POLICY "Healthcare staff can update allergies" ON public.allergies
  FOR UPDATE USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

-- Immunizations
CREATE TABLE IF NOT EXISTS public.immunizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  vaccine_name TEXT NOT NULL,
  administration_date DATE NOT NULL,
  administered_by UUID REFERENCES auth.users(id),
  lot_number TEXT,
  expiration_date DATE,
  site TEXT,
  route TEXT,
  dose TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.immunizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view immunizations" ON public.immunizations
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

CREATE POLICY "Healthcare staff can manage immunizations" ON public.immunizations
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

-- Lab Results
CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  test_date TIMESTAMPTZ NOT NULL,
  result_value TEXT,
  unit TEXT,
  reference_range TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'abnormal', 'critical')),
  ordered_by UUID REFERENCES auth.users(id),
  performed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view lab results" ON public.lab_results
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'phlebotomist'::app_role]));

CREATE POLICY "Doctors can manage lab results" ON public.lab_results
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role]));

-- Wound Assessments
CREATE TABLE IF NOT EXISTS public.wound_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  wound_location TEXT NOT NULL,
  wound_type TEXT,
  length_cm NUMERIC,
  width_cm NUMERIC,
  depth_cm NUMERIC,
  drainage_type TEXT,
  drainage_amount TEXT,
  wound_bed_appearance TEXT,
  periwound_condition TEXT,
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  treatment_plan TEXT,
  image_url TEXT,
  assessed_by UUID REFERENCES auth.users(id),
  assessment_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.wound_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view wound assessments" ON public.wound_assessments
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'therapist'::app_role]));

CREATE POLICY "Healthcare staff can manage wound assessments" ON public.wound_assessments
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

-- Patient Notes
CREATE TABLE IF NOT EXISTS public.patient_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  note_type TEXT CHECK (note_type IN ('progress', 'soap', 'assessment', 'general')),
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  content TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view notes" ON public.patient_notes
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'therapist'::app_role]));

CREATE POLICY "Healthcare staff can create notes" ON public.patient_notes
  FOR INSERT WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'therapist'::app_role]));

-- Procedures
CREATE TABLE IF NOT EXISTS public.procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  procedure_name TEXT NOT NULL,
  procedure_code TEXT,
  performed_at TIMESTAMPTZ NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  assistant_ids UUID[],
  procedure_notes TEXT,
  complications TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view procedures" ON public.procedures
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

CREATE POLICY "Doctors can manage procedures" ON public.procedures
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role]));

-- Consultations
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  consultation_type TEXT NOT NULL,
  consultant_name TEXT NOT NULL,
  consultation_date TIMESTAMPTZ NOT NULL,
  reason TEXT,
  findings TEXT,
  recommendations TEXT,
  notes TEXT,
  requested_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view consultations" ON public.consultations
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

CREATE POLICY "Doctors can manage consultations" ON public.consultations
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role]));

-- Advanced Directives
CREATE TABLE IF NOT EXISTS public.advanced_directives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  directive_type TEXT NOT NULL,
  document_url TEXT,
  effective_date DATE,
  expiration_date DATE,
  healthcare_proxy_name TEXT,
  healthcare_proxy_phone TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.advanced_directives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view advanced directives" ON public.advanced_directives
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'social_worker'::app_role]));

CREATE POLICY "Authorized staff can manage advanced directives" ON public.advanced_directives
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'social_worker'::app_role]));

-- Medical Diagnoses
CREATE TABLE IF NOT EXISTS public.medical_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  diagnosis_code TEXT NOT NULL,
  diagnosis_name TEXT NOT NULL,
  diagnosis_type TEXT CHECK (diagnosis_type IN ('primary', 'secondary', 'admitting', 'discharge')),
  onset_date DATE,
  resolution_date DATE,
  status TEXT CHECK (status IN ('active', 'resolved', 'chronic', 'recurrent')),
  diagnosed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medical_diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view diagnoses" ON public.medical_diagnoses
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

CREATE POLICY "Doctors can manage diagnoses" ON public.medical_diagnoses
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role]));

-- Discharge Summaries
CREATE TABLE IF NOT EXISTS public.discharge_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  generated_by UUID REFERENCES auth.users(id) NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  summary_data JSONB NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.discharge_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view discharge summaries" ON public.discharge_summaries
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

CREATE POLICY "Doctors can create discharge summaries" ON public.discharge_summaries
  FOR INSERT WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role]));

-- =============================================
-- 2. CARECOIN BLOCKCHAIN INFRASTRUCTURE
-- =============================================

-- CareCoin Contract Registry
CREATE TABLE IF NOT EXISTS public.carecoin_contract (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_address TEXT NOT NULL UNIQUE,
  deployer_address TEXT NOT NULL,
  network TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  block_number BIGINT,
  contract_name TEXT DEFAULT 'CareCoin',
  contract_symbol TEXT DEFAULT 'CARE',
  total_supply NUMERIC DEFAULT 0,
  abi JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.carecoin_contract ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view contract" ON public.carecoin_contract FOR SELECT USING (true);
CREATE POLICY "Admins can manage contract" ON public.carecoin_contract FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Charting Profits (pending token distributions)
CREATE TABLE IF NOT EXISTS public.charting_profits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES auth.users(id) NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_hash TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.charting_profits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profits" ON public.charting_profits FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Admins can view all profits" ON public.charting_profits FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert profits" ON public.charting_profits FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update profits" ON public.charting_profits FOR UPDATE USING (true);

CREATE INDEX idx_charting_profits_status ON public.charting_profits(status) WHERE status = 'pending';
CREATE INDEX idx_charting_profits_provider ON public.charting_profits(provider_id);

-- CareCoins Transactions
CREATE TABLE IF NOT EXISTS public.care_coins_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  from_user_id UUID REFERENCES auth.users(id),
  to_user_id UUID REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('mint', 'transfer', 'cashout', 'reward', 'staking', 'unstaking')),
  transaction_hash TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.care_coins_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.care_coins_transactions 
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Admins can view all transactions" ON public.care_coins_transactions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert transactions" ON public.care_coins_transactions FOR INSERT WITH CHECK (true);

CREATE INDEX idx_care_coins_tx_user ON public.care_coins_transactions(user_id);
CREATE INDEX idx_care_coins_tx_type ON public.care_coins_transactions(transaction_type);
CREATE INDEX idx_care_coins_tx_created ON public.care_coins_transactions(created_at DESC);

-- Cashout Requests
CREATE TABLE IF NOT EXISTS public.cashout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount NUMERIC NOT NULL,
  usd_amount NUMERIC NOT NULL,
  exchange_rate NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'paypal', 'venmo', 'amazon_gift', 'visa_gift', 'mastercard_gift', 'target_gift', 'walmart_gift', 'starbucks_gift')),
  account_info JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cashout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cashout requests" ON public.cashout_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create cashout requests" ON public.cashout_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all cashout requests" ON public.cashout_requests FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cashout requests" ON public.cashout_requests FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_cashout_status ON public.cashout_requests(status);
CREATE INDEX idx_cashout_user ON public.cashout_requests(user_id);

-- Bill Payments
CREATE TABLE IF NOT EXISTS public.bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  patient_id UUID REFERENCES public.patients(id),
  bill_amount NUMERIC NOT NULL,
  carecoins_used NUMERIC NOT NULL,
  usd_equivalent NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bill payments" ON public.bill_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all bill payments" ON public.bill_payments FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create bill payments" ON public.bill_payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CareCoin Merchants
CREATE TABLE IF NOT EXISTS public.carecoin_merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name TEXT NOT NULL,
  merchant_type TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  acceptance_rate NUMERIC DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.carecoin_merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active merchants" ON public.carecoin_merchants FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage merchants" ON public.carecoin_merchants FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Health Rewards
CREATE TABLE IF NOT EXISTS public.health_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reward_type TEXT NOT NULL,
  reward_name TEXT NOT NULL,
  carecoins_earned NUMERIC NOT NULL,
  goal_description TEXT,
  completion_date TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.health_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards" ON public.health_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reward claims" ON public.health_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Healthcare staff can verify rewards" ON public.health_rewards 
  FOR UPDATE USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

CREATE INDEX idx_health_rewards_user ON public.health_rewards(user_id);

-- CareCoin Staking
CREATE TABLE IF NOT EXISTS public.carecoin_staking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  staked_amount NUMERIC NOT NULL,
  staking_period_days INTEGER NOT NULL,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  apy_rate NUMERIC NOT NULL,
  rewards_earned NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  transaction_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.carecoin_staking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own staking" ON public.carecoin_staking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create staking positions" ON public.carecoin_staking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own staking" ON public.carecoin_staking FOR UPDATE USING (auth.uid() = user_id);

-- Insurance Payments
CREATE TABLE IF NOT EXISTS public.insurance_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) NOT NULL,
  insurance_company TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  claim_number TEXT,
  service_date DATE NOT NULL,
  billed_amount NUMERIC NOT NULL,
  paid_amount NUMERIC,
  patient_responsibility NUMERIC,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'submitted', 'approved', 'denied', 'paid')),
  carecoins_credited NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.insurance_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view insurance payments" ON public.insurance_payments
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'billing'::app_role]));
CREATE POLICY "Billing staff can manage insurance payments" ON public.insurance_payments
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'billing'::app_role]));

-- CareCoin Rate Limiting
CREATE TABLE IF NOT EXISTS public.carecoin_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  mint_count INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.carecoin_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits" ON public.carecoin_rate_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage rate limits" ON public.carecoin_rate_limits FOR ALL USING (true);

-- Multi-Signature Wallet Infrastructure
CREATE TABLE IF NOT EXISTS public.multisig_signers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  signer_address TEXT NOT NULL,
  signer_name TEXT,
  is_active BOOLEAN DEFAULT true,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(wallet_address, signer_address)
);

ALTER TABLE public.multisig_signers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view signers" ON public.multisig_signers FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage signers" ON public.multisig_signers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.multisig_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  data JSONB,
  required_signatures INTEGER NOT NULL DEFAULT 2,
  current_signatures INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executed', 'rejected', 'expired')),
  expiry_date TIMESTAMPTZ,
  transaction_hash TEXT,
  created_by UUID REFERENCES auth.users(id),
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.multisig_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view multisig transactions" ON public.multisig_transactions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can create multisig transactions" ON public.multisig_transactions FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update multisig transactions" ON public.multisig_transactions FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.multisig_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.multisig_transactions(id) ON DELETE CASCADE NOT NULL,
  signer_address TEXT NOT NULL,
  signature TEXT NOT NULL,
  signed_by UUID REFERENCES auth.users(id),
  signed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(transaction_id, signer_address)
);

ALTER TABLE public.multisig_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view signatures" ON public.multisig_signatures FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can sign transactions" ON public.multisig_signatures FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Security Audit Logs
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security logs" ON public.security_audit_log FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert security logs" ON public.security_audit_log FOR INSERT WITH CHECK (true);

CREATE INDEX idx_security_audit_user ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_severity ON public.security_audit_log(severity);
CREATE INDEX idx_security_audit_created ON public.security_audit_log(created_at DESC);

-- CareCoin Deployment Status
CREATE TABLE IF NOT EXISTS public.carecoin_deployment_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_phase TEXT NOT NULL CHECK (deployment_phase IN ('testnet', 'mainnet', 'production')),
  network TEXT NOT NULL,
  contract_address TEXT,
  deployer_address TEXT,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  transaction_hash TEXT,
  block_number BIGINT,
  gas_used NUMERIC,
  deployment_cost NUMERIC,
  liquidity_added NUMERIC,
  error_message TEXT,
  deployed_by UUID REFERENCES auth.users(id),
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.carecoin_deployment_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view deployment status" ON public.carecoin_deployment_status FOR SELECT USING (true);
CREATE POLICY "Admins can manage deployment status" ON public.carecoin_deployment_status FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Gas Wallet Monitoring
CREATE TABLE IF NOT EXISTS public.gas_wallet_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL,
  balance NUMERIC NOT NULL,
  gas_price_gwei NUMERIC,
  estimated_transactions_remaining INTEGER,
  last_refill_amount NUMERIC,
  last_refill_at TIMESTAMPTZ,
  alert_threshold NUMERIC DEFAULT 10,
  is_low BOOLEAN DEFAULT false,
  monitored_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gas_wallet_monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view gas monitoring" ON public.gas_wallet_monitoring FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can update gas monitoring" ON public.gas_wallet_monitoring FOR ALL USING (true);

CREATE INDEX idx_gas_wallet_network ON public.gas_wallet_monitoring(network);
CREATE INDEX idx_gas_wallet_low ON public.gas_wallet_monitoring(is_low) WHERE is_low = true;

-- =============================================
-- 3. RIDE BOOKING INFRASTRUCTURE
-- =============================================

-- Drivers
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER,
  license_plate TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_expiry DATE,
  insurance_policy TEXT,
  insurance_expiry DATE,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'suspended')),
  current_latitude NUMERIC,
  current_longitude NUMERIC,
  rating NUMERIC DEFAULT 5.0,
  total_ratings INTEGER DEFAULT 0,
  total_rides INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  care_coins_balance NUMERIC DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view drivers" ON public.drivers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Drivers can view own profile" ON public.drivers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Drivers can update own profile" ON public.drivers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage drivers" ON public.drivers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_drivers_location ON public.drivers(current_latitude, current_longitude);
CREATE INDEX idx_drivers_user ON public.drivers(user_id);

-- Rides
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  driver_id UUID REFERENCES public.drivers(id),
  driver_name TEXT,
  driver_phone TEXT,
  driver_rating NUMERIC,
  patient_id UUID REFERENCES public.patients(id),
  pickup_address TEXT NOT NULL,
  pickup_latitude NUMERIC NOT NULL,
  pickup_longitude NUMERIC NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_latitude NUMERIC NOT NULL,
  dropoff_longitude NUMERIC NOT NULL,
  ride_type TEXT NOT NULL,
  estimated_cost NUMERIC NOT NULL,
  final_cost NUMERIC,
  distance_km NUMERIC,
  duration_minutes INTEGER,
  driver_earnings NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  scheduled_for TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  pickup_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rides" ON public.rides FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Drivers can view assigned rides" ON public.rides FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.drivers WHERE drivers.user_id = auth.uid() AND drivers.id = rides.driver_id));
CREATE POLICY "Users can create rides" ON public.rides FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update rides" ON public.rides FOR UPDATE USING (true);
CREATE POLICY "Admins can view all rides" ON public.rides FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_rides_user ON public.rides(user_id);
CREATE INDEX idx_rides_driver ON public.rides(driver_id);
CREATE INDEX idx_rides_status ON public.rides(status);
CREATE INDEX idx_rides_created ON public.rides(created_at DESC);

-- Driver Ratings
CREATE TABLE IF NOT EXISTS public.driver_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.drivers(id) NOT NULL,
  passenger_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ride_id, passenger_id)
);

ALTER TABLE public.driver_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view ratings" ON public.driver_ratings FOR SELECT USING (true);
CREATE POLICY "Passengers can rate completed rides" ON public.driver_ratings 
  FOR INSERT WITH CHECK (
    auth.uid() = passenger_id AND 
    EXISTS (SELECT 1 FROM public.rides WHERE rides.id = ride_id AND rides.status = 'completed')
  );
CREATE POLICY "Passengers can update own ratings" ON public.driver_ratings FOR UPDATE USING (auth.uid() = passenger_id);

CREATE INDEX idx_driver_ratings_driver ON public.driver_ratings(driver_id);
CREATE INDEX idx_driver_ratings_ride ON public.driver_ratings(ride_id);

-- Favorite Locations
CREATE TABLE IF NOT EXISTS public.favorite_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  location_type TEXT CHECK (location_type IN ('home', 'work', 'hospital', 'other')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.favorite_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorite locations" ON public.favorite_locations FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_favorite_locations_user ON public.favorite_locations(user_id);

-- =============================================
-- 4. CLINICAL DECISION SUPPORT SYSTEM
-- =============================================

-- Medication Interactions
CREATE TABLE IF NOT EXISTS public.medication_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_a TEXT NOT NULL,
  medication_b TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'contraindicated')),
  description TEXT,
  clinical_effects TEXT,
  management_strategy TEXT,
  evidence_level TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(medication_a, medication_b)
);

ALTER TABLE public.medication_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view interactions" ON public.medication_interactions
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'pharmacist'::app_role]));
CREATE POLICY "Admins can manage interactions" ON public.medication_interactions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_medication_interactions_severity ON public.medication_interactions(severity);

-- Clinical Guidelines
CREATE TABLE IF NOT EXISTS public.clinical_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guideline_title TEXT NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  evidence_level TEXT,
  source_organization TEXT,
  publication_date DATE,
  last_updated DATE,
  guideline_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clinical_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view guidelines" ON public.clinical_guidelines
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]) AND is_active = true);
CREATE POLICY "Admins can manage guidelines" ON public.clinical_guidelines
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_clinical_guidelines_category ON public.clinical_guidelines(category);
CREATE INDEX idx_clinical_guidelines_condition ON public.clinical_guidelines(condition);

-- Clinical Alerts
CREATE TABLE IF NOT EXISTS public.clinical_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  triggered_by TEXT,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clinical_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view clinical alerts" ON public.clinical_alerts
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));
CREATE POLICY "Healthcare staff can acknowledge alerts" ON public.clinical_alerts
  FOR UPDATE USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));
CREATE POLICY "System can create alerts" ON public.clinical_alerts FOR INSERT WITH CHECK (true);

CREATE INDEX idx_clinical_alerts_patient ON public.clinical_alerts(patient_id);
CREATE INDEX idx_clinical_alerts_severity ON public.clinical_alerts(severity);
CREATE INDEX idx_clinical_alerts_unacknowledged ON public.clinical_alerts(is_acknowledged) WHERE is_acknowledged = false;

-- =============================================
-- 5. CARE COORDINATION HUB
-- =============================================

-- Care Team Members
CREATE TABLE IF NOT EXISTS public.care_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.care_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view care teams" ON public.care_team_members
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'social_worker'::app_role]));
CREATE POLICY "Authorized staff can manage care teams" ON public.care_team_members
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

CREATE INDEX idx_care_team_patient ON public.care_team_members(patient_id);
CREATE INDEX idx_care_team_user ON public.care_team_members(user_id);

-- Discharge Plans
CREATE TABLE IF NOT EXISTS public.discharge_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  planned_discharge_date DATE,
  discharge_disposition TEXT,
  discharge_location TEXT,
  medications_on_discharge JSONB,
  follow_up_appointments JSONB,
  home_care_services JSONB,
  equipment_needs TEXT,
  dietary_instructions TEXT,
  activity_restrictions TEXT,
  warning_signs TEXT,
  emergency_contacts JSONB,
  transportation_arranged BOOLEAN DEFAULT false,
  patient_education_completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  last_updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.discharge_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view discharge plans" ON public.discharge_plans
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'social_worker'::app_role]));
CREATE POLICY "Authorized staff can manage discharge plans" ON public.discharge_plans
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'social_worker'::app_role]));

CREATE INDEX idx_discharge_plans_patient ON public.discharge_plans(patient_id);

-- Care Tasks
CREATE TABLE IF NOT EXISTS public.care_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  task_title TEXT NOT NULL,
  task_description TEXT,
  task_type TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view care tasks" ON public.care_tasks
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'social_worker'::app_role]));
CREATE POLICY "Assigned staff can update tasks" ON public.care_tasks
  FOR UPDATE USING (auth.uid() = assigned_to OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));
CREATE POLICY "Healthcare staff can create tasks" ON public.care_tasks
  FOR INSERT WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'social_worker'::app_role]));

CREATE INDEX idx_care_tasks_patient ON public.care_tasks(patient_id);
CREATE INDEX idx_care_tasks_assigned ON public.care_tasks(assigned_to);
CREATE INDEX idx_care_tasks_status ON public.care_tasks(status);

-- =============================================
-- 6. PREDICTIVE ANALYTICS
-- =============================================

-- Patient Risk Scores
CREATE TABLE IF NOT EXISTS public.patient_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  risk_type TEXT NOT NULL,
  risk_score NUMERIC NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors JSONB,
  recommendations TEXT,
  calculated_by TEXT DEFAULT 'AI_MODEL',
  model_version TEXT,
  confidence_score NUMERIC,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view risk scores" ON public.patient_risk_scores
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));
CREATE POLICY "System can create risk scores" ON public.patient_risk_scores FOR INSERT WITH CHECK (true);

CREATE INDEX idx_patient_risk_scores_patient ON public.patient_risk_scores(patient_id);
CREATE INDEX idx_patient_risk_scores_level ON public.patient_risk_scores(risk_level);
CREATE INDEX idx_patient_risk_scores_calculated ON public.patient_risk_scores(calculated_at DESC);

-- Capacity Metrics
CREATE TABLE IF NOT EXISTS public.capacity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  total_beds INTEGER NOT NULL,
  occupied_beds INTEGER NOT NULL,
  available_beds INTEGER NOT NULL,
  icu_beds INTEGER,
  occupied_icu_beds INTEGER,
  emergency_admissions INTEGER,
  scheduled_admissions INTEGER,
  discharges INTEGER,
  average_length_of_stay NUMERIC,
  bed_turnover_rate NUMERIC,
  occupancy_rate NUMERIC,
  predicted_admissions_next_24h INTEGER,
  predicted_discharges_next_24h INTEGER,
  staffing_level NUMERIC,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.capacity_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view capacity metrics" ON public.capacity_metrics
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));
CREATE POLICY "Admins can manage capacity metrics" ON public.capacity_metrics
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_capacity_metrics_date ON public.capacity_metrics(metric_date DESC);

-- =============================================
-- 7. HIPAA COMPLIANCE & SECURITY
-- =============================================

-- PHI Access Logs
CREATE TABLE IF NOT EXISTS public.phi_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  justification TEXT,
  is_emergency_access BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.phi_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view PHI access logs" ON public.phi_access_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can create PHI access logs" ON public.phi_access_logs FOR INSERT WITH CHECK (true);

CREATE INDEX idx_phi_access_user ON public.phi_access_logs(user_id);
CREATE INDEX idx_phi_access_patient ON public.phi_access_logs(patient_id);
CREATE INDEX idx_phi_access_emergency ON public.phi_access_logs(is_emergency_access) WHERE is_emergency_access = true;
CREATE INDEX idx_phi_access_created ON public.phi_access_logs(created_at DESC);

-- Data Retention Policies
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL UNIQUE,
  retention_period_days INTEGER NOT NULL,
  archive_after_days INTEGER,
  delete_after_days INTEGER,
  compliance_requirement TEXT,
  policy_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view retention policies" ON public.data_retention_policies
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage retention policies" ON public.data_retention_policies
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Patient Consents
CREATE TABLE IF NOT EXISTS public.patient_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_date DATE NOT NULL,
  expiration_date DATE,
  consent_document_url TEXT,
  witness_id UUID REFERENCES auth.users(id),
  revoked BOOLEAN DEFAULT false,
  revoked_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view consents" ON public.patient_consents
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'social_worker'::app_role]));
CREATE POLICY "Authorized staff can manage consents" ON public.patient_consents
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'social_worker'::app_role]));

CREATE INDEX idx_patient_consents_patient ON public.patient_consents(patient_id);

-- =============================================
-- 8. ADVANCED AUTHENTICATION
-- =============================================

-- MFA Settings
CREATE TABLE IF NOT EXISTS public.user_mfa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_method TEXT CHECK (mfa_method IN ('totp', 'sms', 'email')),
  phone_number TEXT,
  totp_secret TEXT,
  backup_codes TEXT[],
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own MFA settings" ON public.user_mfa_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own MFA settings" ON public.user_mfa_settings FOR ALL USING (auth.uid() = user_id);

-- User Devices
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  device_name TEXT,
  device_type TEXT,
  device_fingerprint TEXT UNIQUE NOT NULL,
  is_trusted BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices" ON public.user_devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own devices" ON public.user_devices FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_user_devices_user ON public.user_devices(user_id);

-- User Sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  device_id UUID REFERENCES public.user_devices(id),
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sessions" ON public.user_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can manage sessions" ON public.user_sessions FOR ALL USING (true);

CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active) WHERE is_active = true;

-- =============================================
-- 9. PATIENT PORTAL & FAMILY ACCESS
-- =============================================

-- Patient Portal Users
CREATE TABLE IF NOT EXISTS public.patient_portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  portal_user_id UUID REFERENCES auth.users(id) NOT NULL,
  relationship TEXT CHECK (relationship IN ('self', 'spouse', 'parent', 'child', 'guardian', 'authorized_representative')),
  access_level TEXT CHECK (access_level IN ('full', 'limited', 'view_only')),
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(patient_id, portal_user_id)
);

ALTER TABLE public.patient_portal_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portal users can view own access" ON public.patient_portal_users FOR SELECT USING (auth.uid() = portal_user_id);
CREATE POLICY "Healthcare staff can manage portal access" ON public.patient_portal_users
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

CREATE INDEX idx_patient_portal_patient ON public.patient_portal_users(patient_id);
CREATE INDEX idx_patient_portal_user ON public.patient_portal_users(portal_user_id);

-- Medication Administration Log
CREATE TABLE IF NOT EXISTS public.medication_administration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_order_id UUID REFERENCES public.medication_orders(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  administered_by UUID REFERENCES auth.users(id) NOT NULL,
  administered_at TIMESTAMPTZ NOT NULL,
  dose_given TEXT NOT NULL,
  route TEXT NOT NULL,
  site TEXT,
  patient_response TEXT,
  adverse_reaction TEXT,
  reason_not_given TEXT,
  status TEXT DEFAULT 'given' CHECK (status IN ('given', 'refused', 'held', 'missed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medication_administration_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view med admin log" ON public.medication_administration_log
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'pharmacist'::app_role]));
CREATE POLICY "Nurses can create med admin records" ON public.medication_administration_log
  FOR INSERT WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'nurse'::app_role]));

CREATE INDEX idx_med_admin_order ON public.medication_administration_log(medication_order_id);
CREATE INDEX idx_med_admin_patient ON public.medication_administration_log(patient_id);
CREATE INDEX idx_med_admin_time ON public.medication_administration_log(administered_at DESC);

-- =============================================
-- 10. HEALTHCARE SYSTEM INTEGRATIONS
-- =============================================

-- HL7 Message Log
CREATE TABLE IF NOT EXISTS public.hl7_message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT UNIQUE NOT NULL,
  message_type TEXT NOT NULL,
  message_event TEXT NOT NULL,
  patient_id UUID REFERENCES public.patients(id),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  source_system TEXT,
  destination_system TEXT,
  raw_message TEXT NOT NULL,
  parsed_data JSONB,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'failed', 'rejected')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hl7_message_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view HL7 messages" ON public.hl7_message_log
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can manage HL7 messages" ON public.hl7_message_log FOR ALL USING (true);

CREATE INDEX idx_hl7_patient ON public.hl7_message_log(patient_id);
CREATE INDEX idx_hl7_status ON public.hl7_message_log(processing_status);
CREATE INDEX idx_hl7_created ON public.hl7_message_log(created_at DESC);

-- External System Mappings
CREATE TABLE IF NOT EXISTS public.external_system_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_id UUID NOT NULL,
  internal_type TEXT NOT NULL,
  external_system TEXT NOT NULL,
  external_id TEXT NOT NULL,
  external_type TEXT,
  mapping_metadata JSONB,
  last_synced_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(internal_id, internal_type, external_system)
);

ALTER TABLE public.external_system_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view mappings" ON public.external_system_mappings
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));
CREATE POLICY "Admins can manage mappings" ON public.external_system_mappings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- External Lab Orders
CREATE TABLE IF NOT EXISTS public.external_lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  ordered_by UUID REFERENCES auth.users(id) NOT NULL,
  lab_system TEXT NOT NULL,
  external_order_id TEXT,
  test_codes TEXT[],
  test_names TEXT[],
  priority TEXT CHECK (priority IN ('routine', 'urgent', 'stat')),
  specimen_type TEXT,
  collection_date TIMESTAMPTZ,
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'sent', 'received', 'in_progress', 'completed', 'cancelled')),
  results_received BOOLEAN DEFAULT false,
  results_data JSONB,
  order_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.external_lab_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view external lab orders" ON public.external_lab_orders
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'phlebotomist'::app_role]));
CREATE POLICY "Authorized staff can manage lab orders" ON public.external_lab_orders
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role]));

CREATE INDEX idx_external_lab_patient ON public.external_lab_orders(patient_id);
CREATE INDEX idx_external_lab_status ON public.external_lab_orders(order_status);

-- =============================================
-- 11. SCHEDULING & TELEMEDICINE
-- =============================================

-- Provider Schedules
CREATE TABLE IF NOT EXISTS public.provider_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES auth.users(id) NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  appointment_duration_minutes INTEGER DEFAULT 30,
  location TEXT,
  schedule_type TEXT CHECK (schedule_type IN ('regular', 'override', 'holiday')),
  effective_date DATE,
  expiration_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.provider_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view provider schedules" ON public.provider_schedules FOR SELECT USING (is_available = true);
CREATE POLICY "Providers can manage own schedule" ON public.provider_schedules FOR ALL USING (auth.uid() = provider_id);
CREATE POLICY "Admins can manage all schedules" ON public.provider_schedules FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_provider_schedules_provider ON public.provider_schedules(provider_id);

-- Provider Time Off
CREATE TABLE IF NOT EXISTS public.provider_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES auth.users(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.provider_time_off ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view own time off" ON public.provider_time_off FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Providers can request time off" ON public.provider_time_off FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Admins can manage time off" ON public.provider_time_off FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Facilities
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_name TEXT NOT NULL,
  facility_type TEXT,
  room_number TEXT,
  floor TEXT,
  building TEXT,
  capacity INTEGER,
  equipment_available TEXT[],
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view facilities" ON public.facilities
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'receptionist'::app_role]));
CREATE POLICY "Admins can manage facilities" ON public.facilities FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Equipment
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  serial_number TEXT UNIQUE,
  manufacturer TEXT,
  model TEXT,
  purchase_date DATE,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_service')),
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view equipment" ON public.equipment
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));
CREATE POLICY "Admins can manage equipment" ON public.equipment FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Resource Reservations
CREATE TABLE IF NOT EXISTS public.resource_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES public.facilities(id),
  equipment_id UUID REFERENCES public.equipment(id),
  reserved_by UUID REFERENCES auth.users(id) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.resource_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view reservations" ON public.resource_reservations
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'receptionist'::app_role]));
CREATE POLICY "Healthcare staff can manage reservations" ON public.resource_reservations
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'receptionist'::app_role]));

-- Appointment Waitlist
CREATE TABLE IF NOT EXISTS public.appointment_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id),
  appointment_type TEXT NOT NULL,
  preferred_date_start DATE,
  preferred_date_end DATE,
  preferred_time_of_day TEXT,
  priority TEXT CHECK (priority IN ('routine', 'urgent', 'flexible')),
  notes TEXT,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'contacted', 'scheduled', 'cancelled')),
  added_by UUID REFERENCES auth.users(id),
  scheduled_appointment_id UUID REFERENCES public.appointments(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointment_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view waitlist" ON public.appointment_waitlist
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'receptionist'::app_role]));
CREATE POLICY "Healthcare staff can manage waitlist" ON public.appointment_waitlist
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'receptionist'::app_role]));

CREATE INDEX idx_waitlist_patient ON public.appointment_waitlist(patient_id);
CREATE INDEX idx_waitlist_status ON public.appointment_waitlist(status);

-- Appointment Reminders
CREATE TABLE IF NOT EXISTS public.appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT CHECK (reminder_type IN ('sms', 'email', 'phone')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
  message_content TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view reminders" ON public.appointment_reminders
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'receptionist'::app_role]));
CREATE POLICY "System can manage reminders" ON public.appointment_reminders FOR ALL USING (true);

CREATE INDEX idx_reminders_appointment ON public.appointment_reminders(appointment_id);
CREATE INDEX idx_reminders_scheduled ON public.appointment_reminders(scheduled_for);

-- Video Sessions
CREATE TABLE IF NOT EXISTS public.video_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  peer_id TEXT,
  provider_id UUID REFERENCES auth.users(id) NOT NULL,
  patient_id UUID REFERENCES public.patients(id),
  session_type TEXT CHECK (session_type IN ('consultation', 'follow_up', 'emergency', 'group')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled', 'no_show')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  recording_url TEXT,
  recording_consent BOOLEAN DEFAULT false,
  session_notes TEXT,
  connection_quality TEXT,
  technical_issues TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view own video sessions" ON public.video_sessions
  FOR SELECT USING (auth.uid() = provider_id OR EXISTS (SELECT 1 FROM public.patients WHERE patients.id = video_sessions.patient_id AND patients.user_id = auth.uid()));
CREATE POLICY "Providers can manage video sessions" ON public.video_sessions
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

CREATE INDEX idx_video_sessions_provider ON public.video_sessions(provider_id);
CREATE INDEX idx_video_sessions_patient ON public.video_sessions(patient_id);
CREATE INDEX idx_video_sessions_status ON public.video_sessions(status);

-- =============================================
-- 12. COMMERCIAL LAUNCH INFRASTRUCTURE
-- =============================================

-- KYC Verifications
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  verification_provider TEXT,
  verification_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'expired')),
  identity_verified BOOLEAN DEFAULT false,
  address_verified BOOLEAN DEFAULT false,
  documents_submitted JSONB,
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own KYC" ON public.kyc_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own KYC" ON public.kyc_verifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage KYC" ON public.kyc_verifications FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Tax Reporting
CREATE TABLE IF NOT EXISTS public.tax_reporting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tax_year INTEGER NOT NULL,
  total_carecoins_earned NUMERIC NOT NULL,
  total_usd_value NUMERIC NOT NULL,
  report_type TEXT CHECK (report_type IN ('1099-MISC', '1099-K', 'summary')),
  report_url TEXT,
  generated_at TIMESTAMPTZ,
  sent_to_user BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tax_year, report_type)
);

ALTER TABLE public.tax_reporting ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax reports" ON public.tax_reporting FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage tax reports" ON public.tax_reporting FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_tax_reporting_user ON public.tax_reporting(user_id);
CREATE INDEX idx_tax_reporting_year ON public.tax_reporting(tax_year);

-- Terms Acceptances
CREATE TABLE IF NOT EXISTS public.terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  terms_version TEXT NOT NULL,
  terms_type TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own terms acceptances" ON public.terms_acceptances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create terms acceptances" ON public.terms_acceptances FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_terms_acceptances_user ON public.terms_acceptances(user_id);

-- Legal Disclaimers
CREATE TABLE IF NOT EXISTS public.legal_disclaimers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disclaimer_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_location TEXT[],
  requires_acknowledgment BOOLEAN DEFAULT false,
  effective_date DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.legal_disclaimers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active disclaimers" ON public.legal_disclaimers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage disclaimers" ON public.legal_disclaimers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Beta Testers
CREATE TABLE IF NOT EXISTS public.beta_testers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  invitation_code TEXT UNIQUE,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'completed', 'removed')),
  feedback_count INTEGER DEFAULT 0,
  bugs_reported INTEGER DEFAULT 0,
  features_tested INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.beta_testers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beta testers can view own status" ON public.beta_testers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage beta testers" ON public.beta_testers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- User Feedback
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  feedback_type TEXT CHECK (feedback_type IN ('bug', 'feature_request', 'improvement', 'general')),
  category TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'planned', 'in_progress', 'resolved', 'wont_fix')),
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback" ON public.user_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create feedback" ON public.user_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage feedback" ON public.user_feedback FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_user_feedback_user ON public.user_feedback(user_id);
CREATE INDEX idx_user_feedback_status ON public.user_feedback(status);

-- Transaction Alerts
CREATE TABLE IF NOT EXISTS public.transaction_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  transaction_id UUID,
  alert_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transaction_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transaction alerts" ON public.transaction_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can acknowledge alerts" ON public.transaction_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage alerts" ON public.transaction_alerts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_transaction_alerts_user ON public.transaction_alerts(user_id);
CREATE INDEX idx_transaction_alerts_acknowledged ON public.transaction_alerts(is_acknowledged) WHERE is_acknowledged = false;

-- Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  target_roles TEXT[],
  target_users UUID[],
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view feature flags" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- User Onboarding
CREATE TABLE IF NOT EXISTS public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  onboarding_step TEXT NOT NULL,
  completed_steps TEXT[],
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 5,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT false,
  progress_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding" ON public.user_onboarding FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding" ON public.user_onboarding FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create onboarding" ON public.user_onboarding FOR INSERT WITH CHECK (true);

-- Support Tickets
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'TKT-' || to_char(nextval('ticket_number_seq'), 'FM00000');
END;
$$;

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE DEFAULT generate_ticket_number(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT CHECK (category IN ('technical', 'billing', 'carecoin', 'account', 'general')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage tickets" ON public.support_tickets FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_assigned ON public.support_tickets(assigned_to);

-- Support Messages
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ticket participants can view messages" ON public.support_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE support_tickets.id = ticket_id 
      AND (support_tickets.user_id = auth.uid() OR support_tickets.assigned_to = auth.uid())
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );
CREATE POLICY "Ticket participants can create messages" ON public.support_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE support_tickets.id = ticket_id 
      AND (support_tickets.user_id = auth.uid() OR support_tickets.assigned_to = auth.uid())
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE INDEX idx_support_messages_ticket ON public.support_messages(ticket_id);
CREATE INDEX idx_support_messages_created ON public.support_messages(created_at);

-- =============================================
-- 13. ADDITIONAL TABLES
-- =============================================

-- Call Lights
CREATE TABLE IF NOT EXISTS public.call_lights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  room_number TEXT NOT NULL,
  priority TEXT DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'emergency')),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'responding', 'resolved')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  response_time_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.call_lights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view call lights" ON public.call_lights
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'cna'::app_role]));
CREATE POLICY "Healthcare staff can manage call lights" ON public.call_lights
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'nurse'::app_role, 'cna'::app_role]));

CREATE INDEX idx_call_lights_patient ON public.call_lights(patient_id);
CREATE INDEX idx_call_lights_status ON public.call_lights(status);

-- Messages (Chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = recipient_id);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);

-- Patient Assignments
CREATE TABLE IF NOT EXISTS public.patient_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES auth.users(id) NOT NULL,
  assignment_type TEXT NOT NULL,
  shift_date DATE NOT NULL,
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view assignments" ON public.patient_assignments
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));
CREATE POLICY "Authorized staff can manage assignments" ON public.patient_assignments
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'nurse'::app_role]));

CREATE INDEX idx_patient_assignments_patient ON public.patient_assignments(patient_id);
CREATE INDEX idx_patient_assignments_staff ON public.patient_assignments(staff_id);
CREATE INDEX idx_patient_assignments_date ON public.patient_assignments(shift_date);

-- Health Goals
CREATE TABLE IF NOT EXISTS public.health_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  patient_id UUID REFERENCES public.patients(id),
  goal_type TEXT NOT NULL,
  goal_description TEXT NOT NULL,
  target_value TEXT,
  current_value TEXT,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'abandoned', 'revised')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  milestones JSONB,
  carecoin_reward NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health goals" ON public.health_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own health goals" ON public.health_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Healthcare staff can view patient health goals" ON public.health_goals
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

CREATE INDEX idx_health_goals_user ON public.health_goals(user_id);
CREATE INDEX idx_health_goals_patient ON public.health_goals(patient_id);
CREATE INDEX idx_health_goals_status ON public.health_goals(status);

-- Care Plans
CREATE TABLE IF NOT EXISTS public.care_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  goals JSONB NOT NULL,
  interventions JSONB NOT NULL,
  medications JSONB,
  assessments_schedule JSONB,
  review_frequency TEXT,
  next_review_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  last_reviewed_by UUID REFERENCES auth.users(id),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view care plans" ON public.care_plans
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'social_worker'::app_role]));
CREATE POLICY "Authorized staff can manage care plans" ON public.care_plans
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role]));

CREATE INDEX idx_care_plans_patient ON public.care_plans(patient_id);
CREATE INDEX idx_care_plans_status ON public.care_plans(status);

-- Evaluations
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  evaluation_type TEXT NOT NULL,
  evaluator_id UUID REFERENCES auth.users(id) NOT NULL,
  evaluation_date TIMESTAMPTZ NOT NULL,
  findings JSONB NOT NULL,
  recommendations TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view evaluations" ON public.evaluations
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'nurse'::app_role, 'therapist'::app_role]));
CREATE POLICY "Authorized staff can manage evaluations" ON public.evaluations
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'doctor'::app_role, 'therapist'::app_role]));

CREATE INDEX idx_evaluations_patient ON public.evaluations(patient_id);
CREATE INDEX idx_evaluations_evaluator ON public.evaluations(evaluator_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- CareCoin Rate Limit Check
CREATE OR REPLACE FUNCTION check_carecoin_rate_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mint_count INTEGER;
  v_last_reset TIMESTAMPTZ;
BEGIN
  -- Get current rate limit info
  SELECT mint_count, last_reset_at INTO v_mint_count, v_last_reset
  FROM carecoin_rate_limits
  WHERE user_id = p_user_id;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO carecoin_rate_limits (user_id, mint_count, last_reset_at)
    VALUES (p_user_id, 0, now());
    RETURN TRUE;
  END IF;
  
  -- Reset counter if more than 24 hours have passed
  IF v_last_reset < (now() - INTERVAL '24 hours') THEN
    UPDATE carecoin_rate_limits
    SET mint_count = 0, last_reset_at = now()
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;
  
  -- Check if under limit (100 per day)
  IF v_mint_count < 100 THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Update Driver Rating Stats
CREATE OR REPLACE FUNCTION update_driver_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avg_rating NUMERIC;
  v_total_ratings INTEGER;
BEGIN
  -- Calculate new average rating and total count
  SELECT AVG(rating)::NUMERIC(3,2), COUNT(*)
  INTO v_avg_rating, v_total_ratings
  FROM driver_ratings
  WHERE driver_id = NEW.driver_id;
  
  -- Update driver record
  UPDATE drivers
  SET 
    rating = v_avg_rating,
    total_ratings = v_total_ratings,
    updated_at = now()
  WHERE id = NEW.driver_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for driver ratings
DROP TRIGGER IF EXISTS trigger_update_driver_rating_stats ON public.driver_ratings;
CREATE TRIGGER trigger_update_driver_rating_stats
AFTER INSERT OR UPDATE ON public.driver_ratings
FOR EACH ROW
EXECUTE FUNCTION update_driver_rating_stats();

-- Calculate Distance (Haversine Formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 NUMERIC,
  lon1 NUMERIC,
  lat2 NUMERIC,
  lon2 NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  R CONSTANT NUMERIC := 6371; -- Earth radius in kilometers
  dLat NUMERIC;
  dLon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  a := sin(dLat/2) * sin(dLat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dLon/2) * sin(dLon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN R * c;
END;
$$;

-- Increment Balance Helper
CREATE OR REPLACE FUNCTION increment_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET care_coins_balance = care_coins_balance + p_amount
  WHERE id = p_user_id;
END;
$$;