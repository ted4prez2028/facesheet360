-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create conversations table for 1-on-1 provider communication
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL,
  participant_2_id UUID NOT NULL,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(participant_1_id, participant_2_id)
);

-- Create messages table for chat messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'web',
  user_id UUID NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  message_type TEXT DEFAULT 'text',
  replied BOOLEAN DEFAULT false,
  reply_content TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Healthcare staff can view own conversations"
  ON public.conversations FOR SELECT
  USING (
    auth.uid() = participant_1_id OR 
    auth.uid() = participant_2_id
  );

CREATE POLICY "Healthcare staff can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (
    auth.uid() = participant_1_id AND
    has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'pharmacist', 'therapist', 'cna', 'social_worker'])
  );

CREATE POLICY "Healthcare staff can update own conversations"
  ON public.conversations FOR UPDATE
  USING (
    auth.uid() = participant_1_id OR 
    auth.uid() = participant_2_id
  );

-- RLS Policies for messages
CREATE POLICY "Healthcare staff can view own messages"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id
  );

CREATE POLICY "Healthcare staff can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'pharmacist', 'therapist', 'cna', 'social_worker'])
  );

CREATE POLICY "Recipients can mark messages as read"
  ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Triggers for updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Enable realtime for conversations and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Audit logging triggers for messages (HIPAA compliance)
CREATE TRIGGER audit_messages_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_messages_update
  AFTER UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();

CREATE TRIGGER audit_messages_delete
  AFTER DELETE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_data_audit();