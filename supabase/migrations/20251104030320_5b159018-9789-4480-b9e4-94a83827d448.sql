-- Add subscription fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Add EHR reference IDs to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS epic_id TEXT,
ADD COLUMN IF NOT EXISTS pointclickcare_id TEXT;

-- Create index for faster EHR lookups
CREATE INDEX IF NOT EXISTS idx_patients_epic_id ON patients(epic_id);
CREATE INDEX IF NOT EXISTS idx_patients_pointclickcare_id ON patients(pointclickcare_id);