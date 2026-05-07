-- Enable pg_net for HTTP requests from the database
create extension if not exists pg_net;

-- Function called by pg_cron every 15 minutes
create or replace function trigger_booking_reminder()
returns void as $$
begin
  perform net.http_post(
    url     := 'https://nailtime.vercel.app/api/cron/reminder',
    headers := jsonb_build_object('x-cron-secret', 'nailtime2026'),
    body    := '{}'::jsonb
  );
end;
$$ language plpgsql;

-- Schedule: every 15 minutes at :00 :15 :30 :45
select cron.schedule(
  'booking-reminder',
  '0,15,30,45 * * * *',
  'select trigger_booking_reminder()'
);
