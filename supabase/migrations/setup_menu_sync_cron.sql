
-- Setup cron job to sync menu items daily at midnight
BEGIN;
  SELECT cron.schedule(
    'sync-menu-items',  -- job name
    '0 0 * * *',       -- every day at midnight
    'SELECT supabase.functions.http.invoke(''sync-menu-items'');'
  );
COMMIT;
