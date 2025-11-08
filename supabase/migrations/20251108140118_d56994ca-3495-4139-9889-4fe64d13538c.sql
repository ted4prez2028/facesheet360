-- Add pinned messages support for group messages
ALTER TABLE group_messages
ADD COLUMN is_pinned boolean DEFAULT false,
ADD COLUMN pinned_by uuid REFERENCES auth.users(id),
ADD COLUMN pinned_at timestamp with time zone;

-- Create notification preferences table
CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  group_id uuid REFERENCES group_conversations(id) ON DELETE CASCADE,
  is_muted boolean DEFAULT false,
  muted_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, conversation_id),
  UNIQUE(user_id, group_id)
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notification preferences"
  ON notification_preferences FOR DELETE
  USING (user_id = auth.uid());

-- Create index for better performance
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_conversation_id ON notification_preferences(conversation_id);
CREATE INDEX idx_notification_preferences_group_id ON notification_preferences(group_id);
CREATE INDEX idx_group_messages_pinned ON group_messages(group_id, is_pinned) WHERE is_pinned = true;

-- Add trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();