-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- Enable realtime for care_coins_transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE care_coins_transactions;
ALTER TABLE care_coins_transactions REPLICA IDENTITY FULL;

-- Create health goals table
CREATE TABLE IF NOT EXISTS public.health_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('appointment_attendance', 'medication_adherence', 'vital_signs_tracking', 'therapy_attendance', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL DEFAULT 1,
  current_value INTEGER NOT NULL DEFAULT 0,
  reward_amount NUMERIC NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on health_goals
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;

-- Policies for health_goals
CREATE POLICY "Patients can view own health goals"
  ON public.health_goals FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Healthcare staff can view health goals"
  ON public.health_goals FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role));

CREATE POLICY "Healthcare staff can create health goals"
  ON public.health_goals FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role));

CREATE POLICY "Healthcare staff can update health goals"
  ON public.health_goals FOR UPDATE
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role));

-- Create goal achievements table to track when goals are completed
CREATE TABLE IF NOT EXISTS public.goal_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES health_goals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  reward_amount NUMERIC NOT NULL,
  achievement_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  transaction_id UUID REFERENCES care_coins_transactions(id)
);

-- Enable RLS on goal_achievements
ALTER TABLE public.goal_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON public.goal_achievements FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Healthcare staff can view achievements"
  ON public.goal_achievements FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role));

-- Create function to automatically award CareCoins when goal is completed
CREATE OR REPLACE FUNCTION public.award_goal_completion()
RETURNS TRIGGER AS $$
DECLARE
  patient_user_id UUID;
  transaction_id UUID;
BEGIN
  -- Only process if goal was just completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get the patient's user_id
    SELECT user_id INTO patient_user_id
    FROM patients
    WHERE id = NEW.patient_id;

    IF patient_user_id IS NOT NULL THEN
      -- Create transaction record
      INSERT INTO care_coins_transactions (
        user_id,
        to_user_id,
        amount,
        transaction_type,
        description
      ) VALUES (
        patient_user_id,
        patient_user_id,
        NEW.reward_amount,
        'reward',
        'Health Goal Completed: ' || NEW.title
      ) RETURNING id INTO transaction_id;

      -- Update patient's balance
      PERFORM increment_balance(patient_user_id, NEW.reward_amount);

      -- Record achievement
      INSERT INTO goal_achievements (
        goal_id,
        patient_id,
        reward_amount,
        transaction_id
      ) VALUES (
        NEW.id,
        NEW.patient_id,
        NEW.reward_amount,
        transaction_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic reward distribution
CREATE TRIGGER on_goal_completed
  AFTER UPDATE ON public.health_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.award_goal_completion();

-- Create function to update health goals updated_at
CREATE OR REPLACE FUNCTION public.update_health_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_health_goals_updated_at_trigger
  BEFORE UPDATE ON public.health_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_health_goals_updated_at();