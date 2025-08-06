-- Enable pg_cron extension for scheduling medication reminders
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to check for medication reminders every 5 minutes
SELECT cron.schedule(
  'medication-reminders-check',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://tuembzleutkexrmrzxkg.supabase.co/functions/v1/medication-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZW1iemxldXRrZXhybXJ6eGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTcwMzksImV4cCI6MjA1ODU3MzAzOX0.nEy5OlfHeFFIFinnAbD2oYGsxnSuE-mTXqAGv98f1eE"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Comment to track this change
COMMENT ON EXTENSION pg_cron IS 'Enabled for medication reminder scheduling - checks every 5 minutes for upcoming doses';