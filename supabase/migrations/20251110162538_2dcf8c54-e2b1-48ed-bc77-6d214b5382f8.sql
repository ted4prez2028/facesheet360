-- Create message templates table for quick responses
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Array of variable names like ["patient_name", "date"]
  category TEXT DEFAULT 'general',
  is_shared BOOLEAN DEFAULT false, -- If true, template is available to all users in organization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Users can view their own templates
CREATE POLICY "Users can view own templates"
ON message_templates FOR SELECT
USING (user_id = auth.uid());

-- Users can view shared templates
CREATE POLICY "Users can view shared templates"
ON message_templates FOR SELECT
USING (is_shared = true);

-- Users can create their own templates
CREATE POLICY "Users can create own templates"
ON message_templates FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
ON message_templates FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
ON message_templates FOR DELETE
USING (user_id = auth.uid());

-- Admins can create shared templates
CREATE POLICY "Admins can create shared templates"
ON message_templates FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update any template
CREATE POLICY "Admins can update any template"
ON message_templates FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes
CREATE INDEX idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX idx_message_templates_category ON message_templates(category);
CREATE INDEX idx_message_templates_shared ON message_templates(is_shared);

-- Add trigger for updated_at
CREATE TRIGGER update_message_templates_updated_at
BEFORE UPDATE ON message_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();