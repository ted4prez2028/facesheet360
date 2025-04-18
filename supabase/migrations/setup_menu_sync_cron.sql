
-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a job to run every day at midnight to sync menu items
SELECT cron.schedule(
  'sync-menu-items-daily',  -- unique job name
  '0 0 * * *',              -- every day at midnight
  $$
  SELECT http_post(
    'https://tuembzleutkexrmrzxkg.supabase.co/functions/v1/sync-menu-items',
    '{}',
    'application/json',
    ARRAY[['Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZW1iemxldXRrZXhybXJ6eGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTcwMzksImV4cCI6MjA1ODU3MzAzOX0.nEy5OlfHeFFIFinnAbD2oYGsxnSuE-mTXqAGv98f1eE']]
  );
  $$
);
