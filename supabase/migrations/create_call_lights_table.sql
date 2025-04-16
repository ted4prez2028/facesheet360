
-- Create call_lights table for patient assistance requests
CREATE TABLE IF NOT EXISTS public.call_lights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    room_number TEXT NOT NULL,
    request_type TEXT NOT NULL, -- 'assistance', 'emergency', 'pain', 'bathroom', etc.
    message TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'in_progress', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id),
    organization TEXT -- Match with staff organization
);

-- Enable RLS
ALTER TABLE public.call_lights ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view call lights for their organization
CREATE POLICY "Users can view call lights for their organization" 
ON public.call_lights
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() 
        AND users.organization = call_lights.organization
    )
);

-- Create policy to allow patients to create call light requests
CREATE POLICY "Users can create call light requests" 
ON public.call_lights
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy to allow staff to update call light status
CREATE POLICY "Staff can update call light status" 
ON public.call_lights
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() 
        AND users.organization = call_lights.organization
    )
);

-- Add the table to realtime publication for real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_lights;

-- Add full replica identity for real-time updates
ALTER TABLE public.call_lights REPLICA IDENTITY FULL;
