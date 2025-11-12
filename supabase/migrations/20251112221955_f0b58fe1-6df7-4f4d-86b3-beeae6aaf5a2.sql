-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  medical_record_number TEXT,
  room_number TEXT,
  admission_date TIMESTAMP WITH TIME ZONE,
  discharge_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  facial_data TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  primary_physician TEXT,
  avatar_url TEXT,
  discharge_condition TEXT,
  discharge_disposition TEXT,
  discharge_activity TEXT,
  discharge_diet TEXT,
  discharge_instructions TEXT,
  discharge_follow_up TEXT,
  discharged_at TIMESTAMP WITH TIME ZONE,
  discharged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view all patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','doctor','nurse','therapist','cna','social_worker','phlebotomist','pharmacist','receptionist','billing']::app_role[]));

CREATE POLICY "Healthcare staff can insert patients"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','doctor','nurse','receptionist']::app_role[]));

CREATE POLICY "Healthcare staff can update patients"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','doctor','nurse','receptionist']::app_role[]));

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  patient_id UUID REFERENCES public.patients(id),
  resource_id TEXT,
  event_type TEXT NOT NULL,
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','doctor','nurse']::app_role[]));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create patient_vitals table
CREATE TABLE public.patient_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  recorded_by UUID REFERENCES auth.users(id),
  temperature DECIMAL,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation DECIMAL,
  weight DECIMAL,
  height DECIMAL,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view vitals"
  ON public.patient_vitals FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','doctor','nurse','therapist','cna']::app_role[]));

CREATE POLICY "Healthcare staff can insert vitals"
  ON public.patient_vitals FOR INSERT
  TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','doctor','nurse','cna']::app_role[]));

-- Create medication_orders table
CREATE TABLE public.medication_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  prescribed_by UUID REFERENCES auth.users(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  route TEXT,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.medication_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view medications"
  ON public.medication_orders FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','doctor','nurse','pharmacist']::app_role[]));

CREATE POLICY "Doctors and pharmacists can manage medications"
  ON public.medication_orders FOR ALL
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','doctor','pharmacist']::app_role[]));

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES auth.users(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  appointment_type TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','doctor','nurse','receptionist']::app_role[]));

CREATE POLICY "Healthcare staff can manage appointments"
  ON public.appointments FOR ALL
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','doctor','nurse','receptionist']::app_role[]));