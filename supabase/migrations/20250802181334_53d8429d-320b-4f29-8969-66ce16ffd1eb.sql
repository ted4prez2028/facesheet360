-- Create conversations table for better message threading
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1_id uuid NOT NULL,
  participant_2_id uuid NOT NULL,
  last_message_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(participant_1_id, participant_2_id)
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policy for conversations
CREATE POLICY "Users can view their conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can update their conversations" 
ON public.conversations 
FOR UPDATE 
USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Update messages table to support conversations
ALTER TABLE public.messages 
ADD COLUMN conversation_id uuid REFERENCES public.conversations(id),
ADD COLUMN recipient_id text,
ADD COLUMN sender_id text NOT NULL DEFAULT '';

-- Update existing messages to have sender_id
UPDATE public.messages SET sender_id = user_id WHERE sender_id = '';

-- Create index for better performance
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_recipient ON public.messages(sender_id, recipient_id);
CREATE INDEX idx_conversations_participants ON public.conversations(participant_1_id, participant_2_id);

-- Create trigger to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();