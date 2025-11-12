-- Phase 1 & 2: Fix Security and Add Discharge Data Structure (Fixed View)

-- 1. Add discharge-related columns to patients table
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS discharge_condition TEXT,
ADD COLUMN IF NOT EXISTS discharge_disposition TEXT,
ADD COLUMN IF NOT EXISTS discharge_activity TEXT,
ADD COLUMN IF NOT EXISTS discharge_diet TEXT,
ADD COLUMN IF NOT EXISTS discharge_instructions TEXT,
ADD COLUMN IF NOT EXISTS discharge_follow_up TEXT,
ADD COLUMN IF NOT EXISTS discharged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS discharged_by UUID REFERENCES auth.users(id);

-- 2. Create procedures table
CREATE TABLE IF NOT EXISTS public.procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  procedure_name TEXT NOT NULL,
  procedure_date TIMESTAMP WITH TIME ZONE NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view procedures"
ON public.procedures
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'doctor'::app_role) OR
  has_role(auth.uid(), 'nurse'::app_role)
);

CREATE POLICY "Doctors can create procedures"
ON public.procedures
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Doctors can update procedures"
ON public.procedures
FOR UPDATE
USING (has_role(auth.uid(), 'doctor'::app_role));

-- 3. Create consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  consultant_name TEXT,
  consultation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  requested_by UUID REFERENCES auth.users(id),
  findings TEXT,
  recommendations TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view consultations"
ON public.consultations
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'doctor'::app_role) OR
  has_role(auth.uid(), 'nurse'::app_role)
);

CREATE POLICY "Doctors can create consultations"
ON public.consultations
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Doctors can update consultations"
ON public.consultations
FOR UPDATE
USING (has_role(auth.uid(), 'doctor'::app_role));

-- 4. Create discharge_summaries table for audit trail
CREATE TABLE IF NOT EXISTS public.discharge_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  pdf_url TEXT,
  summary_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.discharge_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view discharge summaries"
ON public.discharge_summaries
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'doctor'::app_role) OR
  has_role(auth.uid(), 'nurse'::app_role)
);

CREATE POLICY "Doctors can create discharge summaries"
ON public.discharge_summaries
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'doctor'::app_role));