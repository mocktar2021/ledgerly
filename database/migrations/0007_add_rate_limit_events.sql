-- Supports the Chapter 60 rate limiter fix: shared storage every Vercel
-- function instance can see, replacing the original in-memory counter
-- that silently didn't work across instances.

create table rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  created_at timestamptz not null default now()
);
create index idx_rate_limit_events_key_created on rate_limit_events(key, created_at);

-- No RLS: only ever accessed via the service role client from
-- lib/rate-limit.ts, the same reasoning as processed_webhook_events
-- (migration 0006).
