
-- First make sure pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule job to run every 10 minutes
SELECT cron.schedule(
  'check-upcoming-appointments',
  '*/10 * * * *', -- Every 10 minutes
  $$
  SELECT
    net.http_post(
      url:='https://tuembzleutkexrmrzxkg.supabase.co/functions/v1/check-upcoming-appointments',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZW1iemxldXRrZXhybXJ6eGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTcwMzksImV4cCI6MjA1ODU3MzAzOX0.nEy5OlfHeFFIFinnAbD2oYGsxnSuE-mTXqAGv98f1eE"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
