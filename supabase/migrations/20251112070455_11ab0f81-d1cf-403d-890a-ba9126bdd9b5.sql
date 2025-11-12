-- Create drivers table with location tracking
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL DEFAULT 'standard',
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  license_plate TEXT,
  license_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy')),
  current_latitude NUMERIC,
  current_longitude NUMERIC,
  location_updated_at TIMESTAMP WITH TIME ZONE,
  rating NUMERIC DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  total_rides INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  care_coins_balance NUMERIC DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add driver_id to rides table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'driver_id'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN driver_id UUID REFERENCES public.drivers(id);
  END IF;
END $$;

-- Add driver info columns to rides if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'driver_name'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN driver_name TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'driver_phone'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN driver_phone TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'driver_rating'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN driver_rating NUMERIC;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'pickup_latitude'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN pickup_latitude NUMERIC;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'pickup_longitude'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN pickup_longitude NUMERIC;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'dropoff_latitude'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN dropoff_latitude NUMERIC;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'dropoff_longitude'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN dropoff_longitude NUMERIC;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'distance_km'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN distance_km NUMERIC;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rides' AND column_name = 'driver_earnings'
  ) THEN
    ALTER TABLE public.rides ADD COLUMN driver_earnings NUMERIC DEFAULT 0;
  END IF;
END $$;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_drivers_location ON public.drivers(current_latitude, current_longitude) WHERE status = 'online';
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON public.rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);

-- Enable RLS
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drivers table
DROP POLICY IF EXISTS "Drivers can view own profile" ON public.drivers;
CREATE POLICY "Drivers can view own profile"
  ON public.drivers FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Drivers can update own profile" ON public.drivers;
CREATE POLICY "Drivers can update own profile"
  ON public.drivers FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all drivers" ON public.drivers;
CREATE POLICY "Admins can view all drivers"
  ON public.drivers FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can create drivers" ON public.drivers;
CREATE POLICY "System can create drivers"
  ON public.drivers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can update drivers" ON public.drivers;
CREATE POLICY "System can update drivers"
  ON public.drivers FOR UPDATE
  USING (true);

-- Update trigger for drivers
CREATE OR REPLACE FUNCTION update_drivers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_drivers_updated_at_trigger ON public.drivers;
CREATE TRIGGER update_drivers_updated_at_trigger
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_drivers_updated_at();

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 NUMERIC, lon1 NUMERIC, 
  lat2 NUMERIC, lon2 NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  earth_radius NUMERIC := 6371; -- km
  dlat NUMERIC;
  dlon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;