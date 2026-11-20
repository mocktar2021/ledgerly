-- Step 2 of 4 in the bookings normalization (Chapter 28).
-- Matches existing bookings to clients by email (more reliable than name,
-- since names had drifted into inconsistent spellings across bookings).

update bookings b
set client_id = c.id
from clients c
where b.client_id is null
  and b.provider_id = c.provider_id
  and lower(b.client_email) = lower(c.email);

-- Do not proceed to step 3 until this returns no rows, or every remaining
-- row has been manually reviewed and resolved:
-- select id, client_name, client_email from bookings where client_id is null;
