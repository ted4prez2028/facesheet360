
-- Create the notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- medication, appointment, procedure, system
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_id UUID NULL,
  event_time TIMESTAMP WITH TIME ZONE NULL
);

-- Enable row-level security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Add the table to realtime publication for real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Add full replica identity for real-time updates
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Update the supabase_realtime configuration to include the notifications table
COMMENT ON TABLE public.notifications IS '{"numericOptimization": false}';
