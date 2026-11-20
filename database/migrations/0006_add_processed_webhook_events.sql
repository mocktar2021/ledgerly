-- Supports Chapter 44: idempotent webhook processing. Stripe does not
-- guarantee exactly-once delivery, so every processed event ID is
-- recorded here and checked before any event is acted on again.

create table processed_webhook_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

-- No RLS policies here on purpose: this table has no per-user ownership
-- concept. It's only ever touched by the service role client from the
-- webhook route (see lib/services/webhookEvents.ts), which is the one
-- legitimate use of that elevated client this book endorses.
