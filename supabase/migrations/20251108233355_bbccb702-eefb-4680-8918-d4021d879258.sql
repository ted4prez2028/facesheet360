-- Add first_name and last_name columns to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Migrate existing name data to first_name and last_name
-- For names with spaces, split into first and last name
UPDATE public.patients
SET 
  first_name = CASE 
    WHEN name IS NOT NULL AND position(' ' IN name) > 0 
    THEN TRIM(substring(name FROM 1 FOR position(' ' IN name) - 1))
    ELSE TRIM(name)
  END,
  last_name = CASE 
    WHEN name IS NOT NULL AND position(' ' IN name) > 0 
    THEN TRIM(substring(name FROM position(' ' IN name) + 1))
    ELSE ''
  END
WHERE first_name IS NULL OR last_name IS NULL;

-- Make first_name and last_name required for new entries
ALTER TABLE public.patients 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Add default empty string for backward compatibility
ALTER TABLE public.patients 
ALTER COLUMN first_name SET DEFAULT '',
ALTER COLUMN last_name SET DEFAULT '';