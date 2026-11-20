-- Enable Row Level Security and ownership policies on provider-owned tables.
-- Introduced in Chapter 24. Illustrative/simplified: adjust to match the
-- actual column names and insert/update rules once the full schema is
-- finalized in Part VII.

alter table bookings enable row level security;

create policy "providers can only access their own bookings"
on bookings
for all
using (auth.uid() = provider_id)
with check (auth.uid() = provider_id);

alter table clients enable row level security;

create policy "providers can only access their own clients"
on clients
for all
using (auth.uid() = provider_id)
with check (auth.uid() = provider_id);

alter table subscriptions enable row level security;

create policy "providers can only access their own subscription"
on subscriptions
for all
using (auth.uid() = provider_id)
with check (auth.uid() = provider_id);

-- No default policy is created for unauthenticated (public) access.
-- With RLS enabled and no matching policy, all access is denied by default,
-- which is the correct starting point: open specific, reviewed exceptions
-- later rather than starting from an open table.
