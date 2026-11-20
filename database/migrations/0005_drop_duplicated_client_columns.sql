-- Step 4 of 4 in the bookings normalization (Chapter 28).
-- IRREVERSIBLE. Only run after 0004 has been stable in production and a
-- verified backup exists (see Chapter 30). Once these columns are dropped,
-- their data is gone unless it was captured elsewhere first.

alter table bookings
  drop column client_name,
  drop column client_email,
  drop column client_phone;
