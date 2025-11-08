-- Add missing columns to rides table if they don't exist
DO $$ 
BEGIN
  -- Add estimated_cost_carecoins column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'rides' 
    AND column_name = 'estimated_cost_carecoins'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN estimated_cost_carecoins NUMERIC DEFAULT 50;
  END IF;

  -- Add ride_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'rides' 
    AND column_name = 'ride_type'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN ride_type TEXT DEFAULT 'standard';
  END IF;

  -- Add estimated_arrival_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'rides' 
    AND column_name = 'estimated_arrival_time'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN estimated_arrival_time TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create increment_balance function for CareCoins transactions
CREATE OR REPLACE FUNCTION public.increment_balance(user_id UUID, amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET care_coins_balance = COALESCE(care_coins_balance, 0) + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;