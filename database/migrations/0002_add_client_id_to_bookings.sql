-- Step 1 of 4 in the bookings normalization (Chapter 28).
-- Safe and additive: nullable, doesn't affect any code currently running.

alter table bookings
  add column client_id uuid references clients(id);

create index idx_bookings_client_id on bookings(client_id);
