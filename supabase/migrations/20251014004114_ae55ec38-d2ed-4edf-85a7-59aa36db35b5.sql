-- Add room_number to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS room_number TEXT;

-- Create patient_assignments table for assigning patients to staff
CREATE TABLE IF NOT EXISTS public.patient_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse', 'therapist', 'cna')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES public.users(id),
  notes TEXT,
  UNIQUE(patient_id, assigned_to, role)
);

-- Enable RLS on patient_assignments
ALTER TABLE public.patient_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for patient_assignments
CREATE POLICY "Healthcare providers can view patient assignments"
ON public.patient_assignments
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Healthcare providers can create patient assignments"
ON public.patient_assignments
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Healthcare providers can update patient assignments"
ON public.patient_assignments
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Healthcare providers can delete patient assignments"
ON public.patient_assignments
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create lab_results table
CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_category TEXT,
  result_value TEXT,
  result_unit TEXT,
  reference_range TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'reviewed')),
  ordered_by UUID REFERENCES public.users(id),
  performed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on lab_results
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare providers can manage lab results"
ON public.lab_results
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create imaging_studies table  
CREATE TABLE IF NOT EXISTS public.imaging_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  study_type TEXT NOT NULL,
  body_part TEXT,
  modality TEXT,
  findings TEXT,
  impression TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'reviewed')),
  ordered_by UUID REFERENCES public.users(id),
  performed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on imaging_studies
ALTER TABLE public.imaging_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare providers can manage imaging studies"
ON public.imaging_studies
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create patient_notes table
CREATE TABLE IF NOT EXISTS public.patient_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('progress', 'assessment', 'plan', 'general', 'discharge')),
  note_content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_locked BOOLEAN DEFAULT FALSE
);

-- Enable RLS on patient_notes
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare providers can manage patient notes"
ON public.patient_notes
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_lab_results_updated_at
    BEFORE UPDATE ON public.lab_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_imaging_studies_updated_at
    BEFORE UPDATE ON public.imaging_studies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_notes_updated_at
    BEFORE UPDATE ON public.patient_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();