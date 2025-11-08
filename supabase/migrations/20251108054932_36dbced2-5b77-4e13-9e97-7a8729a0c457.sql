-- Add reminder tracking to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient reminder queries
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_check 
ON appointments (scheduled_time, reminder_sent) 
WHERE status IN ('scheduled', 'confirmed');