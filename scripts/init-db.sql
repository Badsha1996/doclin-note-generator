CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT cron.schedule(
  'delete_expired_otps', 
  '* * * * *', 
  $$DELETE FROM otp_lookup WHERE expires_at < now()$$
);