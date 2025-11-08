-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'nurse', 'therapist', 'cna', 'pharmacist', 'patient');

-- Create users/profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clerk_user_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role app_role DEFAULT 'patient',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Create patients table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    medical_record_number TEXT UNIQUE,
    room_number TEXT,
    admission_date TIMESTAMPTZ,
    discharge_date TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    facial_data TEXT,
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    primary_physician UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create patient_vitals table
CREATE TABLE public.patient_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    recorded_by UUID REFERENCES auth.users(id) NOT NULL,
    temperature DECIMAL,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    oxygen_saturation INTEGER,
    weight DECIMAL,
    height DECIMAL,
    pain_scale INTEGER,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medication_orders table
CREATE TABLE public.medication_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    prescribed_by UUID REFERENCES auth.users(id) NOT NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    route TEXT,
    instructions TEXT,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    administered_at TIMESTAMPTZ,
    administered_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create care_plans table
CREATE TABLE public.care_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    goals TEXT,
    interventions TEXT,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create patient_notes table
CREATE TABLE public.patient_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    note_type TEXT DEFAULT 'general',
    note_content TEXT NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lab_results table
CREATE TABLE public.lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    test_name TEXT NOT NULL,
    test_category TEXT,
    result_value TEXT,
    result_unit TEXT,
    reference_range TEXT,
    status TEXT DEFAULT 'pending',
    ordered_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create imaging_studies table
CREATE TABLE public.imaging_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    study_type TEXT NOT NULL,
    body_part TEXT,
    modality TEXT,
    findings TEXT,
    impression TEXT,
    status TEXT DEFAULT 'scheduled',
    ordered_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create patient_assignments table
CREATE TABLE public.patient_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES auth.users(id) NOT NULL,
    appointment_type TEXT NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status TEXT DEFAULT 'scheduled',
    location TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    participant_2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    author TEXT,
    platform TEXT DEFAULT 'app',
    user_id UUID REFERENCES auth.users(id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    event_id TEXT,
    event_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wound_assessments table
CREATE TABLE public.wound_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    assessed_by UUID REFERENCES auth.users(id) NOT NULL,
    wound_location TEXT NOT NULL,
    wound_type TEXT,
    length_cm DECIMAL,
    width_cm DECIMAL,
    depth_cm DECIMAL,
    stage TEXT,
    drainage_type TEXT,
    drainage_amount TEXT,
    odor BOOLEAN DEFAULT FALSE,
    pain_level INTEGER,
    surrounding_skin TEXT,
    treatment TEXT,
    image_url TEXT,
    ai_analysis TEXT,
    notes TEXT,
    assessed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create call_lights table
CREATE TABLE public.call_lights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    room_number TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    reason TEXT,
    status TEXT DEFAULT 'active',
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    responded_by UUID REFERENCES auth.users(id),
    responded_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    response_time_seconds INTEGER
);

-- Create group_calls table
CREATE TABLE public.group_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL UNIQUE,
    initiator_id UUID REFERENCES auth.users(id) NOT NULL,
    is_video_call BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'active',
    participants JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create care_coins_transactions table
CREATE TABLE public.care_coins_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    from_user_id UUID REFERENCES auth.users(id),
    to_user_id UUID REFERENCES auth.users(id),
    amount DECIMAL NOT NULL,
    transaction_type TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bill_payments table
CREATE TABLE public.bill_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    biller_name TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    care_coins_amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reward_amount DECIMAL,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create carecoin_contract table
CREATE TABLE public.carecoin_contract (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_address TEXT UNIQUE NOT NULL,
    deployer_address TEXT NOT NULL,
    network TEXT DEFAULT 'polygon',
    transaction_hash TEXT,
    contract_details JSONB,
    abi JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create food_orders table
CREATE TABLE public.food_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    ordered_by UUID REFERENCES auth.users(id),
    items JSONB NOT NULL,
    meal_type TEXT,
    dietary_restrictions TEXT[],
    special_instructions TEXT,
    status TEXT DEFAULT 'pending',
    scheduled_time TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    category TEXT,
    status TEXT DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create evaluations table
CREATE TABLE public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    evaluated_by UUID REFERENCES auth.users(id) NOT NULL,
    evaluation_type TEXT NOT NULL,
    findings TEXT,
    recommendations TEXT,
    evaluated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create immunizations table
CREATE TABLE public.immunizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    vaccine_name TEXT NOT NULL,
    dose_number INTEGER,
    administered_by UUID REFERENCES auth.users(id),
    administered_at TIMESTAMPTZ NOT NULL,
    lot_number TEXT,
    expiration_date DATE,
    site TEXT,
    route TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medical_diagnoses table  
CREATE TABLE public.medical_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    diagnosed_by UUID REFERENCES auth.users(id),
    diagnosis_code TEXT,
    diagnosis_name TEXT NOT NULL,
    diagnosis_type TEXT,
    status TEXT DEFAULT 'active',
    onset_date DATE,
    resolved_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create allergies table
CREATE TABLE public.allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    allergen TEXT NOT NULL,
    allergy_type TEXT,
    severity TEXT,
    reaction TEXT,
    noted_by UUID REFERENCES auth.users(id),
    noted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create advanced_directives table
CREATE TABLE public.advanced_directives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    directive_type TEXT NOT NULL,
    document_url TEXT,
    details TEXT,
    effective_date DATE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rides table
CREATE TABLE public.rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'requested',
    driver_name TEXT,
    vehicle_info TEXT,
    estimated_arrival TIMESTAMPTZ,
    actual_pickup_time TIMESTAMPTZ,
    actual_dropoff_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_improvements table
CREATE TABLE public.ai_improvements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    improvement_type TEXT NOT NULL,
    description TEXT NOT NULL,
    code_changes TEXT,
    impact_score DECIMAL,
    status TEXT DEFAULT 'proposed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create app_evolution_metrics table
CREATE TABLE public.app_evolution_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL,
    metric_value DECIMAL NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table for HIPAA compliance
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    patient_id UUID REFERENCES public.patients(id),
    resource_id TEXT,
    action_details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imaging_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wound_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_lights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_coins_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_directives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for patients (healthcare staff can view assigned patients)
CREATE POLICY "Healthcare staff can view patients" ON public.patients 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'therapist') OR
    EXISTS (SELECT 1 FROM public.patient_assignments WHERE patient_id = patients.id AND assigned_to = auth.uid())
  );

CREATE POLICY "Patients can view own record" ON public.patients 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Healthcare staff can insert patients" ON public.patients 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Healthcare staff can update patients" ON public.patients 
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

-- RLS Policies for patient_vitals
CREATE POLICY "Healthcare staff can view vitals" ON public.patient_vitals 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    EXISTS (SELECT 1 FROM public.patient_assignments pa WHERE pa.patient_id = patient_vitals.patient_id AND pa.assigned_to = auth.uid())
  );

CREATE POLICY "Healthcare staff can insert vitals" ON public.patient_vitals 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'cna')
  );

-- RLS Policies for medication_orders
CREATE POLICY "Healthcare staff can view medications" ON public.medication_orders 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'pharmacist')
  );

CREATE POLICY "Doctors can prescribe medications" ON public.medication_orders 
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Nurses and pharmacists can update medications" ON public.medication_orders 
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'pharmacist') OR
    public.has_role(auth.uid(), 'doctor')
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications 
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications 
  FOR INSERT WITH CHECK (TRUE);

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON public.messages 
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can insert messages" ON public.messages 
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- RLS Policies for appointments
CREATE POLICY "Users can view related appointments" ON public.appointments 
  FOR SELECT USING (
    provider_id = auth.uid() OR
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Healthcare staff can create appointments" ON public.appointments 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for audit_logs (admin only)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs 
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs" ON public.audit_logs 
  FOR INSERT WITH CHECK (TRUE);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medication_orders_updated_at BEFORE UPDATE ON public.medication_orders 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_care_plans_updated_at BEFORE UPDATE ON public.care_plans 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patients_mrn ON public.patients(medical_record_number);
CREATE INDEX idx_patient_vitals_patient_id ON public.patient_vitals(patient_id);
CREATE INDEX idx_medication_orders_patient_id ON public.medication_orders(patient_id);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_provider_id ON public.appointments(provider_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_patient_id ON public.audit_logs(patient_id);