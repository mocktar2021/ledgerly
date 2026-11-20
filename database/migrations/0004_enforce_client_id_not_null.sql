-- Step 3 of 4 in the bookings normalization (Chapter 28).
-- Only run after: (1) the backfill in 0003 is fully verified with zero
-- unmatched rows, and (2) application code has been deployed to read/write
-- via client_id and has run successfully in production for a reasonable
-- period.

alter table bookings
  alter column client_id set not null;
