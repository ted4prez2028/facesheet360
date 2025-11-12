-- ============================================
-- IDEA 1: Clinical Decision Support System
-- ============================================

-- Medication interactions database
CREATE TABLE IF NOT EXISTS public.medication_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_1 TEXT NOT NULL,
  medication_2 TEXT NOT NULL,
  interaction_severity TEXT NOT NULL CHECK (interaction_severity IN ('mild', 'moderate', 'severe', 'contraindicated')),
  interaction_description TEXT NOT NULL,
  clinical_guidance TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clinical guidelines
CREATE TABLE IF NOT EXISTS public.clinical_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition TEXT NOT NULL,
  guideline_title TEXT NOT NULL,
  guideline_content TEXT NOT NULL,
  evidence_level TEXT CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  source TEXT,
  version TEXT,
  effective_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clinical alerts/warnings
CREATE TABLE IF NOT EXISTS public.clinical_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('medication_interaction', 'critical_lab', 'vital_sign', 'allergy', 'guideline')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  alert_message TEXT NOT NULL,
  triggered_by TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clinical_alerts_patient ON public.clinical_alerts(patient_id);
CREATE INDEX idx_clinical_alerts_severity ON public.clinical_alerts(severity);
CREATE INDEX idx_clinical_alerts_unresolved ON public.clinical_alerts(resolved) WHERE resolved = false;

-- ============================================
-- IDEA 2: Care Coordination Hub
-- ============================================

-- Care team members
CREATE TABLE IF NOT EXISTS public.care_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL,
  role TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Discharge planning
CREATE TABLE IF NOT EXISTS public.discharge_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  discharge_date DATE,
  discharge_destination TEXT,
  transportation_arranged BOOLEAN DEFAULT false,
  medications_reconciled BOOLEAN DEFAULT false,
  follow_up_scheduled BOOLEAN DEFAULT false,
  patient_education_completed BOOLEAN DEFAULT false,
  dme_ordered BOOLEAN DEFAULT false,
  home_health_arranged BOOLEAN DEFAULT false,
  discharge_instructions TEXT,
  follow_up_appointments JSONB,
  plan_status TEXT DEFAULT 'draft' CHECK (plan_status IN ('draft', 'active', 'completed')),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Task management
CREATE TABLE IF NOT EXISTS public.care_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  task_description TEXT,
  assigned_to UUID,
  assigned_by UUID NOT NULL,
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  mentions JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_care_tasks_patient ON public.care_tasks(patient_id);
CREATE INDEX idx_care_tasks_assigned ON public.care_tasks(assigned_to);
CREATE INDEX idx_care_tasks_status ON public.care_tasks(status);

-- ============================================
-- IDEA 3: Predictive Analytics
-- ============================================

-- Patient risk scores
CREATE TABLE IF NOT EXISTS public.patient_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  risk_type TEXT NOT NULL CHECK (risk_type IN ('readmission', 'fall', 'mortality', 'pressure_ulcer', 'sepsis')),
  risk_score NUMERIC NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  contributing_factors JSONB,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_risk_scores_patient ON public.patient_risk_scores(patient_id);
CREATE INDEX idx_risk_scores_level ON public.patient_risk_scores(risk_level);

-- Hospital capacity tracking
CREATE TABLE IF NOT EXISTS public.capacity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  metric_hour INTEGER CHECK (metric_hour >= 0 AND metric_hour <= 23),
  total_beds INTEGER NOT NULL,
  occupied_beds INTEGER NOT NULL,
  available_beds INTEGER NOT NULL,
  pending_admissions INTEGER DEFAULT 0,
  pending_discharges INTEGER DEFAULT 0,
  er_patients_waiting INTEGER DEFAULT 0,
  forecasted_admissions INTEGER,
  forecasted_discharges INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_capacity_date ON public.capacity_metrics(metric_date);

-- ============================================
-- IDEA 5: Enhanced HIPAA Compliance
-- ============================================

-- PHI access logs (enhanced audit)
CREATE TABLE IF NOT EXISTS public.phi_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  patient_id UUID REFERENCES public.patients(id),
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'edit', 'delete', 'export', 'print', 'emergency')),
  resource_type TEXT NOT NULL,
  resource_id UUID,
  phi_fields_accessed TEXT[],
  access_reason TEXT,
  emergency_access BOOLEAN DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_phi_access_user ON public.phi_access_logs(user_id);
CREATE INDEX idx_phi_access_patient ON public.phi_access_logs(patient_id);
CREATE INDEX idx_phi_access_emergency ON public.phi_access_logs(emergency_access) WHERE emergency_access = true;

-- Data retention policies
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL,
  retention_period_days INTEGER NOT NULL,
  archive_after_days INTEGER,
  delete_after_days INTEGER,
  policy_description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Consent management
CREATE TABLE IF NOT EXISTS public.patient_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('treatment', 'data_sharing', 'research', 'marketing', 'telehealth')),
  consent_status TEXT NOT NULL CHECK (consent_status IN ('granted', 'denied', 'revoked', 'expired')),
  consent_date DATE NOT NULL,
  expiration_date DATE,
  scope TEXT,
  granted_to UUID[],
  consent_document_url TEXT,
  witnessed_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_consents_patient ON public.patient_consents(patient_id);

-- ============================================
-- IDEA 6: Advanced Authentication
-- ============================================

-- MFA settings
CREATE TABLE IF NOT EXISTS public.user_mfa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_method TEXT CHECK (mfa_method IN ('sms', 'authenticator', 'email', 'biometric')),
  phone_number TEXT,
  backup_codes TEXT[],
  last_mfa_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Device tracking
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_name TEXT,
  device_fingerprint TEXT NOT NULL,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  trusted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_devices_user ON public.user_devices(user_id);

-- Session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_id UUID REFERENCES public.user_devices(id),
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sessions_user ON public.user_sessions(user_id);
CREATE INDEX idx_sessions_token ON public.user_sessions(session_token);

-- ============================================
-- IDEA 7 & 8: Patient Portal & Family Access
-- ============================================

-- Patient portal access
CREATE TABLE IF NOT EXISTS public.patient_portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  relationship TEXT CHECK (relationship IN ('self', 'parent', 'spouse', 'child', 'guardian', 'caregiver', 'other')),
  access_level TEXT DEFAULT 'full' CHECK (access_level IN ('full', 'limited', 'view_only')),
  permissions JSONB,
  verified BOOLEAN DEFAULT false,
  verification_date DATE,
  proxy_authorization_document_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portal_users_patient ON public.patient_portal_users(patient_id);

-- Medication administration tracking (for caregivers)
CREATE TABLE IF NOT EXISTS public.medication_administration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  medication_order_id UUID REFERENCES public.medication_orders(id),
  administered_by UUID NOT NULL,
  administered_at TIMESTAMPTZ NOT NULL,
  dose_given TEXT NOT NULL,
  route TEXT,
  site TEXT,
  reason_not_given TEXT,
  patient_response TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- IDEA 9: CareCoin Ecosystem Expansion
-- ============================================

-- Merchant integration
CREATE TABLE IF NOT EXISTS public.carecoin_merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name TEXT NOT NULL,
  merchant_type TEXT CHECK (merchant_type IN ('pharmacy', 'medical_supply', 'lab', 'imaging', 'other')),
  accepts_carecoins BOOLEAN DEFAULT true,
  merchant_wallet_address TEXT,
  discount_percentage NUMERIC,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Health rewards program
CREATE TABLE IF NOT EXISTS public.health_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  patient_id UUID REFERENCES public.patients(id),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('steps', 'vitals_tracking', 'preventive_care', 'health_goal', 'education')),
  reward_amount NUMERIC NOT NULL,
  activity_date DATE NOT NULL,
  activity_details JSONB,
  coins_awarded NUMERIC NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rewards_user ON public.health_rewards(user_id);

-- CareCoin staking
CREATE TABLE IF NOT EXISTS public.carecoin_staking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  staked_amount NUMERIC NOT NULL,
  staking_period_days INTEGER NOT NULL,
  apy_rate NUMERIC NOT NULL,
  stake_start_date DATE NOT NULL,
  stake_end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'early_withdrawal')),
  rewards_earned NUMERIC DEFAULT 0,
  early_withdrawal_penalty NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insurance integration
CREATE TABLE IF NOT EXISTS public.insurance_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  insurance_provider TEXT NOT NULL,
  claim_number TEXT,
  payment_amount NUMERIC NOT NULL,
  carecoins_converted NUMERIC,
  conversion_rate NUMERIC,
  payment_date DATE NOT NULL,
  payment_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- IDEA 13: Healthcare System Integrations
-- ============================================

-- HL7/FHIR message logs
CREATE TABLE IF NOT EXISTS public.hl7_message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_type TEXT NOT NULL,
  message_direction TEXT CHECK (message_direction IN ('inbound', 'outbound')),
  source_system TEXT,
  destination_system TEXT,
  message_id TEXT,
  patient_id UUID REFERENCES public.patients(id),
  message_content TEXT,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hl7_patient ON public.hl7_message_log(patient_id);
CREATE INDEX idx_hl7_status ON public.hl7_message_log(status);

-- External system mappings
CREATE TABLE IF NOT EXISTS public.external_system_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_id UUID NOT NULL,
  internal_type TEXT NOT NULL,
  external_system TEXT NOT NULL,
  external_id TEXT NOT NULL,
  mapping_metadata JSONB,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(external_system, external_id)
);

-- Lab result integration
CREATE TABLE IF NOT EXISTS public.external_lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  lab_system TEXT NOT NULL,
  order_number TEXT NOT NULL,
  test_name TEXT NOT NULL,
  ordered_by UUID,
  ordered_at TIMESTAMPTZ NOT NULL,
  collection_date TIMESTAMPTZ,
  result_status TEXT CHECK (result_status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  result_data JSONB,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.medication_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discharge_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phi_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_administration_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carecoin_merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carecoin_staking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hl7_message_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_system_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_lab_orders ENABLE ROW LEVEL SECURITY;