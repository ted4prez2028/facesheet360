-- Add reactions support to messages
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction text NOT NULL CHECK (reaction IN ('like', 'heart', 'thumbs_up', 'celebrate', 'care')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(message_id, user_id, reaction)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for reactions
CREATE POLICY "Users can view reactions on their messages"
ON public.message_reactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messages
    WHERE id = message_reactions.message_id
    AND (sender_id = auth.uid() OR recipient_id = auth.uid())
  )
);

CREATE POLICY "Users can add reactions"
ON public.message_reactions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own reactions"
ON public.message_reactions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Add voice message duration column
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS voice_duration integer;

-- Create index for message search
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON public.messages USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);