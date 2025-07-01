-- Create subscriptions table to track user subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, cancelled, expired
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT, -- stripe, cashapp
  payment_id TEXT,
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create payments table for tracking all payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL, -- stripe, cashapp
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  external_payment_id TEXT,
  payment_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage payments" ON public.payments
  FOR ALL USING (true);

-- Create enhanced patients table with EHR features
CREATE TABLE IF NOT EXISTS public.patient_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES auth.users(id),
  temperature DECIMAL(5,2),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation DECIMAL(5,2),
  weight DECIMAL(6,2),
  height DECIMAL(5,2),
  pain_scale INTEGER CHECK (pain_scale >= 0 AND pain_scale <= 10),
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for patient vitals
ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare providers can manage patient vitals" ON public.patient_vitals
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create medication orders table
CREATE TABLE public.medication_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  prescribed_by UUID REFERENCES auth.users(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  route TEXT, -- oral, IV, IM, etc.
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  status TEXT DEFAULT 'active', -- active, discontinued, completed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medication_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare providers can manage medication orders" ON public.medication_orders
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create care plans table
CREATE TABLE public.care_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  goals TEXT[],
  interventions TEXT[],
  ai_generated BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active', -- active, completed, discontinued
  start_date DATE NOT NULL,
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare providers can manage care plans" ON public.care_plans
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create call lights table
CREATE TABLE public.call_lights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  room_number TEXT,
  urgency_level TEXT DEFAULT 'normal', -- low, normal, high, emergency
  reason TEXT,
  status TEXT DEFAULT 'active', -- active, responded, resolved
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.call_lights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare providers can manage call lights" ON public.call_lights
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create food orders table
CREATE TABLE public.food_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  ordered_by UUID REFERENCES auth.users(id),
  meal_type TEXT, -- breakfast, lunch, dinner, snack
  items JSONB NOT NULL,
  dietary_restrictions TEXT[],
  special_instructions TEXT,
  status TEXT DEFAULT 'pending', -- pending, preparing, delivered, cancelled
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare providers can manage food orders" ON public.food_orders
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medication_orders_updated_at
  BEFORE UPDATE ON public.medication_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_care_plans_updated_at
  BEFORE UPDATE ON public.care_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();