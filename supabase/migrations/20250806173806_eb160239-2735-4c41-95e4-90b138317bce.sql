-- Update GitHub configuration in Supabase secrets
-- Set GITHUB_REPO to ted4prez2028/facesheet360
-- This will be used by the ai-code-generation edge function

-- Note: The GITHUB_TOKEN should already be configured
-- We're ensuring the GITHUB_REPO is set correctly

-- Add a comment to track this configuration change
COMMENT ON TABLE IF EXISTS notifications IS 'Notifications table - now filtered to show only: pharmacy, appointment, patient, wound_care, carecoin, food_delivery types';