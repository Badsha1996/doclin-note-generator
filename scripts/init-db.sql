CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE INDEX ON topics USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
SELECT cron.schedule(
  'delete_expired_otps',
  '*/15 * * * *',
  $$ DELETE FROM otp_lookup WHERE expires_at < now();$$
);
