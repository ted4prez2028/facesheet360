
-- Create group_calls table for managing multi-participant calls
CREATE TABLE IF NOT EXISTS public.group_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL UNIQUE,
    initiator_id UUID NOT NULL REFERENCES auth.users(id),
    is_video_call BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'active',
    participants JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.group_calls ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view their group calls
CREATE POLICY "Users can view their own group calls" 
ON public.group_calls
FOR SELECT 
USING (
    auth.uid() IN (SELECT jsonb_array_elements_text(participants)::uuid)
);

-- Create policy to allow authenticated users to create group calls
CREATE POLICY "Users can create group calls" 
ON public.group_calls
FOR INSERT 
WITH CHECK (auth.uid() = initiator_id);

-- Create policy to allow participants to update group calls
CREATE POLICY "Participants can update group calls" 
ON public.group_calls
FOR UPDATE 
USING (
    auth.uid() IN (SELECT jsonb_array_elements_text(participants)::uuid)
);
