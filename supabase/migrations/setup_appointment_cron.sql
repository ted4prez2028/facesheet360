
-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a job to run every 5 minutes that invokes the edge function
SELECT cron.schedule(
  'check-upcoming-appointments',  -- unique job name
  '*/5 * * * *',                 -- every 5 minutes
  $$
  SELECT http_post(
    'https://tuembzleutkexrmrzxkg.supabase.co/functions/v1/check-upcoming-appointments',
    '{}',
    'application/json',
    ARRAY[['Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZW1iemxldXRrZXhybXJ6eGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTcwMzksImV4cCI6MjA1ODU3MzAzOX0.nEy5OlfHeFFIFinnAbD2oYGsxnSuE-mTXqAGv98f1eE']]
  );
  $$
);
