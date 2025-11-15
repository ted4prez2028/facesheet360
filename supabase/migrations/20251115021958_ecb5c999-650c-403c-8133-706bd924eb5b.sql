-- Remove the foreign key constraint on user_id to allow more flexible logging
ALTER TABLE public.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

-- Make user_id just a UUID field without foreign key constraint
-- This allows logging even if the user is deleted or from external systems
ALTER TABLE public.audit_logs 
ALTER COLUMN user_id DROP NOT NULL;