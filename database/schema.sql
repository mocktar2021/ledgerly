-- Consolidated current-state schema for Ledgerly.
-- This is a readable snapshot, not a migration — the migrations/ folder
-- is the actual source of truth for how the schema got here (Chapter 28).
-- Update this file when adding a new migration so it stays accurate.

-- Providers extend Supabase's built-in auth.users via a 1:1 profile row.
create table providers (
  id uuid primary key references auth.users(id),
  business_name text,
  bio text,
  photo_url text,
  role text not null default 'provider', -- 'provider' | 'admin' (Chapter 58)
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id),
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now()
);
create index idx_clients_provider_id on clients(provider_id);

-- Final shape after migrations 0001-0005 (Chapter 24, Chapter 28).
create table bookings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id),
  client_id uuid not null references clients(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  capacity int not null default 1,
  status text not null default 'confirmed', -- 'confirmed' | 'canceled'
  created_at timestamptz not null default now(),
  constraint end_after_start check (end_time > start_time)
);
create index idx_bookings_provider_id on bookings(provider_id);
create index idx_bookings_client_id on bookings(client_id);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id),
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  status text not null default 'inactive',
  updated_at timestamptz not null default now()
);
create index idx_subscriptions_provider_id on subscriptions(provider_id);

-- Waitlist entries (Chapter 12-13). One entry per client waiting for a
-- specific provider's next open slot.
create table waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id),
  client_id uuid not null references clients(id),
  notified_at timestamptz,
  claim_expires_at timestamptz,
  status text not null default 'waiting', -- 'waiting' | 'claimed' | 'expired'
  created_at timestamptz not null default now()
);
create index idx_waitlist_provider_id on waitlist_entries(provider_id);

-- Webhook idempotency log (Chapter 44). System-level, no per-user
-- ownership — accessed via the service role client (see
-- lib/services/webhookEvents.ts).
create table processed_webhook_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

-- Rate limiting (Chapter 60 fix). System-level, no per-user ownership —
-- accessed via the service role client (see lib/rate-limit.ts).
create table rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  created_at timestamptz not null default now()
);
create index idx_rate_limit_events_key_created on rate_limit_events(key, created_at);

-- Row Level Security (Chapter 24): enabled on every provider-owned table,
-- with matching ownership policies. See migration 0001 for the full
-- policy definitions.
alter table clients enable row level security;
alter table bookings enable row level security;
alter table subscriptions enable row level security;
alter table waitlist_entries enable row level security;
-- processed_webhook_events intentionally has no policies: only the
-- service role client ever touches it, which bypasses RLS by design.
