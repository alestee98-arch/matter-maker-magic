-- =============================================
-- MATTER: Cron Schedules
-- =============================================

-- Send weekly questions every Monday at 9:00 AM UTC (3:00 AM CST)
SELECT cron.schedule(
  'send-weekly-questions',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://cvwangxqdioecygzyjvz.supabase.co/functions/v1/send-weekly-question',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);
