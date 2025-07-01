
-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  medical_record_number TEXT UNIQUE,
  insurance_provider TEXT,
  insurance_number TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  medical_history TEXT,
  allergies TEXT,
  medications TEXT,
  notes TEXT,
  facial_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id)
);

-- Create vital_signs table
CREATE TABLE IF NOT EXISTS public.vital_signs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  date_recorded TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  heart_rate INTEGER,
  blood_pressure TEXT,
  temperature DECIMAL(4,1),
  oxygen_saturation INTEGER,
  respiratory_rate INTEGER,
  weight DECIMAL(5,1),
  height DECIMAL(5,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id) NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create chart_records table
CREATE TABLE IF NOT EXISTS public.chart_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id) NOT NULL,
  record_type TEXT NOT NULL,
  record_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  notes TEXT,
  vitals JSONB,
  diagnosis TEXT,
  treatment_plan TEXT,
  vital_signs JSONB,
  medications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id) NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'prescribed',
  administered_by UUID REFERENCES auth.users(id),
  administered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  task_description TEXT NOT NULL,
  position TEXT,
  frequency TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create wounds table
CREATE TABLE IF NOT EXISTS public.wounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  assessment TEXT,
  stage TEXT,
  infection_status TEXT,
  healing_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create immunizations table
CREATE TABLE IF NOT EXISTS public.immunizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  vaccine TEXT NOT NULL,
  cvx_code TEXT,
  status TEXT NOT NULL DEFAULT 'administered',
  source TEXT,
  date_administered DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create medical_diagnoses table
CREATE TABLE IF NOT EXISTS public.medical_diagnoses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  clinical_category TEXT,
  category TEXT,
  rank TEXT,
  classification TEXT,
  pdmp_comorbidities TEXT,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create health_predictions table
CREATE TABLE IF NOT EXISTS public.health_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  prediction_type TEXT NOT NULL,
  prediction_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  model_version TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create care_coins_transactions table
CREATE TABLE IF NOT EXISTS public.care_coins_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES auth.users(id),
  to_user_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  reward_category TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create care_coins_cards table
CREATE TABLE IF NOT EXISTS public.care_coins_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  card_type TEXT NOT NULL DEFAULT 'virtual',
  limit_amount INTEGER NOT NULL DEFAULT 1000,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create care_coins_bill_payments table
CREATE TABLE IF NOT EXISTS public.care_coins_bill_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  bill_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_account TEXT NOT NULL,
  bill_info JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create care_coins_achievements table
CREATE TABLE IF NOT EXISTS public.care_coins_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reward_amount INTEGER NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add care_coins_balance column to users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS care_coins_balance INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'doctor';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS online_status BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;

-- Enable Row Level Security on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_coins_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_coins_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_coins_bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_coins_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients table
CREATE POLICY "Users can view patients" ON public.patients FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert patients" ON public.patients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update patients" ON public.patients FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete patients" ON public.patients FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for vital_signs table
CREATE POLICY "Users can view vital signs" ON public.vital_signs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert vital signs" ON public.vital_signs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update vital signs" ON public.vital_signs FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for appointments table
CREATE POLICY "Users can view appointments" ON public.appointments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update appointments" ON public.appointments FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete appointments" ON public.appointments FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for chart_records table
CREATE POLICY "Users can view chart records" ON public.chart_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert chart records" ON public.chart_records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update chart records" ON public.chart_records FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete chart records" ON public.chart_records FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for prescriptions table
CREATE POLICY "Users can view prescriptions" ON public.prescriptions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update prescriptions" ON public.prescriptions FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for other tables
CREATE POLICY "Users can view tasks" ON public.tasks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update tasks" ON public.tasks FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete tasks" ON public.tasks FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view wounds" ON public.wounds FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert wounds" ON public.wounds FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update wounds" ON public.wounds FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete wounds" ON public.wounds FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view immunizations" ON public.immunizations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert immunizations" ON public.immunizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update immunizations" ON public.immunizations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete immunizations" ON public.immunizations FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view medical diagnoses" ON public.medical_diagnoses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert medical diagnoses" ON public.medical_diagnoses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update medical diagnoses" ON public.medical_diagnoses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete medical diagnoses" ON public.medical_diagnoses FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view health predictions" ON public.health_predictions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert health predictions" ON public.health_predictions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update health predictions" ON public.health_predictions FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their care coins transactions" ON public.care_coins_transactions FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can insert care coins transactions" ON public.care_coins_transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their care coins cards" ON public.care_coins_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert care coins cards" ON public.care_coins_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their care coins cards" ON public.care_coins_cards FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their bill payments" ON public.care_coins_bill_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert bill payments" ON public.care_coins_bill_payments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their achievements" ON public.care_coins_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert achievements" ON public.care_coins_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at triggers for all tables
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_patients BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_vital_signs BEFORE UPDATE ON public.vital_signs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_appointments BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_chart_records BEFORE UPDATE ON public.chart_records FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_prescriptions BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_tasks BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_wounds BEFORE UPDATE ON public.wounds FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_immunizations BEFORE UPDATE ON public.immunizations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_medical_diagnoses BEFORE UPDATE ON public.medical_diagnoses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_health_predictions BEFORE UPDATE ON public.health_predictions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_care_coins_cards BEFORE UPDATE ON public.care_coins_cards FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_care_coins_bill_payments BEFORE UPDATE ON public.care_coins_bill_payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient_id ON public.vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON public.appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_chart_records_patient_id ON public.chart_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_tasks_patient_id ON public.tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_wounds_patient_id ON public.wounds(patient_id);
CREATE INDEX IF NOT EXISTS idx_immunizations_patient_id ON public.immunizations(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_diagnoses_patient_id ON public.medical_diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_predictions_patient_id ON public.health_predictions(patient_id);
