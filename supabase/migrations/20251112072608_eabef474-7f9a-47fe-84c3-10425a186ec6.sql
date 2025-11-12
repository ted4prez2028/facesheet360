-- Create favorite_locations table
CREATE TABLE IF NOT EXISTS public.favorite_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT favorite_locations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_favorite_locations_user_id ON public.favorite_locations(user_id);

-- Enable RLS
ALTER TABLE public.favorite_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own favorite locations"
  ON public.favorite_locations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorite locations"
  ON public.favorite_locations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorite locations"
  ON public.favorite_locations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorite locations"
  ON public.favorite_locations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_favorite_locations_updated_at
  BEFORE UPDATE ON public.favorite_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();