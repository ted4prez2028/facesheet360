-- Enable realtime for drivers table
ALTER TABLE public.drivers REPLICA IDENTITY FULL;

-- Add drivers table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;