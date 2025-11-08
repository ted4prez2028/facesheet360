-- Fix function search paths for security
DROP FUNCTION IF EXISTS public.award_goal_completion() CASCADE;
CREATE OR REPLACE FUNCTION public.award_goal_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS award_goal_completion_trigger ON public.health_goals;
CREATE TRIGGER award_goal_completion_trigger
AFTER UPDATE ON public.health_goals
FOR EACH ROW
EXECUTE FUNCTION public.award_goal_completion();

-- Fix update_health_goals_updated_at function
DROP FUNCTION IF EXISTS public.update_health_goals_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_health_goals_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_health_goals_updated_at_trigger ON public.health_goals;
CREATE TRIGGER update_health_goals_updated_at_trigger
BEFORE UPDATE ON public.health_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_health_goals_updated_at();