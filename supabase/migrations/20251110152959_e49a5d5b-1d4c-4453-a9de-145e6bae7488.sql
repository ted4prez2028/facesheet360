-- Create facial_data_history table to store multiple facial registrations per patient
CREATE TABLE IF NOT EXISTS public.facial_data_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  facial_data TEXT NOT NULL,
  confidence DECIMAL(5,2),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  registered_by UUID REFERENCES auth.users(id),
  notes TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Create index for faster lookups
CREATE INDEX idx_facial_data_history_patient_id ON public.facial_data_history(patient_id);
CREATE INDEX idx_facial_data_history_registered_at ON public.facial_data_history(registered_at DESC);

-- Enable RLS
ALTER TABLE public.facial_data_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view facial data history for their patients"
  ON public.facial_data_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = facial_data_history.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert facial data history for their patients"
  ON public.facial_data_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = facial_data_history.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update facial data history for their patients"
  ON public.facial_data_history
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = facial_data_history.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete facial data history for their patients"
  ON public.facial_data_history
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = facial_data_history.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON TABLE public.facial_data_history IS 'Stores historical facial recognition data for patients with timestamps and confidence scores';