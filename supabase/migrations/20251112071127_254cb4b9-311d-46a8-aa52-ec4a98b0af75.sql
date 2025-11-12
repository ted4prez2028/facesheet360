-- Create driver_ratings table
CREATE TABLE IF NOT EXISTS public.driver_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ride_id, passenger_id)
);

-- Create index for fast driver rating lookups
CREATE INDEX IF NOT EXISTS idx_driver_ratings_driver ON public.driver_ratings(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_ratings_ride ON public.driver_ratings(ride_id);

-- Add verification fields to drivers if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'drivers' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'drivers' AND column_name = 'verification_notes'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN verification_notes TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'drivers' AND column_name = 'verified_at'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'drivers' AND column_name = 'verified_by'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN verified_by UUID;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'drivers' AND column_name = 'total_ratings'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN total_ratings INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'drivers' AND column_name = 'average_rating'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN average_rating NUMERIC DEFAULT 5.0 CHECK (average_rating >= 0 AND average_rating <= 5);
  END IF;
END $$;

-- Enable RLS on driver_ratings
ALTER TABLE public.driver_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for driver_ratings
DROP POLICY IF EXISTS "Passengers can rate their completed rides" ON public.driver_ratings;
CREATE POLICY "Passengers can rate their completed rides"
  ON public.driver_ratings FOR INSERT
  WITH CHECK (
    passenger_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.rides
      WHERE rides.id = driver_ratings.ride_id
        AND rides.user_id = auth.uid()
        AND rides.status = 'completed'
    )
  );

DROP POLICY IF EXISTS "Users can view ratings for their rides" ON public.driver_ratings;
CREATE POLICY "Users can view ratings for their rides"
  ON public.driver_ratings FOR SELECT
  USING (
    passenger_id = auth.uid() OR
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    ) OR
    has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Users can update their own ratings" ON public.driver_ratings;
CREATE POLICY "Users can update their own ratings"
  ON public.driver_ratings FOR UPDATE
  USING (passenger_id = auth.uid());

-- Function to update driver rating statistics
CREATE OR REPLACE FUNCTION update_driver_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating NUMERIC;
  total_count INTEGER;
BEGIN
  -- Calculate new average and count
  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, total_count
  FROM public.driver_ratings
  WHERE driver_id = COALESCE(NEW.driver_id, OLD.driver_id);
  
  -- Update driver stats
  UPDATE public.drivers
  SET 
    average_rating = COALESCE(avg_rating, 5.0),
    total_ratings = total_count,
    rating = COALESCE(avg_rating, 5.0),
    updated_at = now()
  WHERE id = COALESCE(NEW.driver_id, OLD.driver_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update driver stats when ratings change
DROP TRIGGER IF EXISTS update_driver_rating_stats_trigger ON public.driver_ratings;
CREATE TRIGGER update_driver_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.driver_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_rating_stats();

-- Update trigger for driver_ratings
CREATE OR REPLACE FUNCTION update_driver_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_driver_ratings_updated_at_trigger ON public.driver_ratings;
CREATE TRIGGER update_driver_ratings_updated_at_trigger
  BEFORE UPDATE ON public.driver_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_ratings_updated_at();

-- Create view for driver performance analytics
CREATE OR REPLACE VIEW driver_performance AS
SELECT 
  d.id,
  d.user_id,
  p.name as driver_name,
  p.email as driver_email,
  d.vehicle_type,
  d.vehicle_make,
  d.vehicle_model,
  d.license_plate,
  d.status,
  d.verification_status,
  d.average_rating,
  d.total_ratings,
  d.total_rides,
  d.total_earnings,
  d.care_coins_balance,
  d.created_at,
  d.is_verified,
  COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) as completed_rides,
  COUNT(DISTINCT CASE WHEN r.status = 'cancelled' THEN r.id END) as cancelled_rides,
  AVG(CASE WHEN r.status = 'completed' THEN r.driver_earnings END) as avg_earnings_per_ride,
  MAX(r.created_at) as last_ride_date
FROM public.drivers d
LEFT JOIN public.profiles p ON d.user_id = p.id
LEFT JOIN public.rides r ON d.id = r.driver_id
GROUP BY d.id, p.name, p.email;

-- Grant access to driver_performance view
GRANT SELECT ON driver_performance TO authenticated;