# ADR 0001: Normalize bookings via a client_id foreign key

**Status:** Accepted (Chapter 28)

## Context

The bookings table stored client name, email, and phone directly on every row instead of referencing the clients table. Updating a client's information in one place didn't update it anywhere else, and inconsistent name formatting across bookings made it unreliable to count unique clients or trust which records referred to the same person.

## Decision

Add a `client_id` foreign key on bookings, referencing `clients.id`, migrated in staged steps (add nullable column → backfill by email match → enforce NOT NULL → drop the old duplicated columns). See `database/migrations/0002` through `0005`.

## Alternatives considered

- **Keep the denormalized columns, add a background sync job to keep them updated.** Rejected: treats the symptom rather than the cause, adds ongoing complexity, and still leaves a window where the copies can disagree.

## Consequences

- Booking queries that need client details now require a join to the clients table.
- Client information has exactly one source of truth; updating it anywhere reflects correctly everywhere.
- Grouping/counting by client (e.g., the repeat-clients analytics view, Chapter 29) is now reliable, grouped by ID rather than fragile name matching.
