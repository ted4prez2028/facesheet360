-- Create group conversations table
CREATE TABLE IF NOT EXISTS public.group_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  avatar_url text,
  description text
);

-- Create group participants table
CREATE TABLE IF NOT EXISTS public.group_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.group_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now(),
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  UNIQUE(group_id, user_id)
);

-- Create group messages table
CREATE TABLE IF NOT EXISTS public.group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.group_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  file_url text,
  file_name text,
  file_type text,
  file_size integer,
  voice_duration integer
);

-- Create read receipts for group messages
CREATE TABLE IF NOT EXISTS public.group_message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.group_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamp with time zone DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.group_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_message_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_conversations
CREATE POLICY "Users can view groups they're part of"
ON public.group_conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_participants
    WHERE group_participants.group_id = group_conversations.id
    AND group_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups"
ON public.group_conversations
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group admins can update groups"
ON public.group_conversations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_participants
    WHERE group_participants.group_id = group_conversations.id
    AND group_participants.user_id = auth.uid()
    AND group_participants.role = 'admin'
  )
);

-- RLS Policies for group_participants
CREATE POLICY "Users can view participants of their groups"
ON public.group_participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_participants gp
    WHERE gp.group_id = group_participants.group_id
    AND gp.user_id = auth.uid()
  )
);

CREATE POLICY "Group creators can add participants"
ON public.group_participants
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_conversations
    WHERE id = group_participants.group_id
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can leave groups"
ON public.group_participants
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for group_messages
CREATE POLICY "Group members can view messages"
ON public.group_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_participants
    WHERE group_participants.group_id = group_messages.group_id
    AND group_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can send messages"
ON public.group_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.group_participants
    WHERE group_participants.group_id = group_messages.group_id
    AND group_participants.user_id = auth.uid()
  )
);

-- RLS Policies for group_message_reads
CREATE POLICY "Users can view read receipts in their groups"
ON public.group_message_reads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_messages gm
    JOIN public.group_participants gp ON gm.group_id = gp.group_id
    WHERE gm.id = group_message_reads.message_id
    AND gp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can mark messages as read"
ON public.group_message_reads
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_participants_group_id ON public.group_participants(group_id);
CREATE INDEX IF NOT EXISTS idx_group_participants_user_id ON public.group_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON public.group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON public.group_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_group_message_reads_message_id ON public.group_message_reads(message_id);

-- Update timestamp trigger
CREATE TRIGGER update_group_conversations_updated_at
  BEFORE UPDATE ON public.group_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();