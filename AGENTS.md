# AGENTS.md

Instructions for any AI coding agent working in this repository. Read this before making any change.

## What this project is

Ledgerly: booking, invoicing, and client management for solo freelance service providers (coaches, tutors, consultants). Next.js App Router, TypeScript, Supabase (Postgres + Auth + RLS), Stripe, deployed on Vercel.

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Unit/integration tests: `npm test`
- End-to-end tests: `npm run test:e2e`
- Type check: `npm run typecheck`

Run tests before considering any task finished. A task is not done if tests aren't passing, and passing tests are not by themselves proof the task is correct — see Tests below.

## Project structure

- `components/`: UI only. No direct database calls, no business rules. Components call services, they don't reimplement them.
- `lib/services/`: business logic (booking rules, waitlist rules, subscription rules). This is the single source of truth for each rule. If a check already exists here, call it, don't rewrite it.
- `lib/validation/`: Zod schemas defining valid input shapes. Routes validate against these before calling any service. This is the authoritative check; any client-side validation is a UX convenience only.
- `api/`: thin route handlers. Parse the request, check auth, call a service, format the response. No business logic in routes.
- `lib/` (outside `services/`): generic reusable helpers with no Ledgerly-specific meaning (Supabase client, Stripe client, date formatting).
- `types/`: shared TypeScript types. There is one canonical type per concept (for example, `Booking` in `types/booking.ts`). Use it. Don't define a local, slightly different shape for the same thing.
- `tests/`: mirrors the structure of `lib/` and `api/`.
- `database/migrations/`: all schema changes go through a migration. Never edit the schema directly. `database/schema.sql` is a readable current-state snapshot — keep it in sync when adding a migration.
- `docs/adr/`: architecture decision records — why past decisions were made, not just what the code does. Check here before re-deciding something already decided.
- `tests/e2e/`: Playwright end-to-end tests for critical flows only (Chapter 37) — not where ordinary unit/integration tests go.
- `TROUBLESHOOTING.md`: the incident response runbook (Chapter 49). Follow it when investigating a reported problem.

Naming: the canonical term for a scheduled session is "booking." Do not introduce "session" or "appointment" as alternate names for the same concept.

## Style

- Match existing patterns in the file or feature area you're editing rather than introducing a new one, even if the new one seems better. Consistency across the codebase matters more than local elegance.
- If an existing pattern genuinely needs to change, extend it deliberately for everyone — don't fork around it quietly for one case.
- Do not refactor, restyle, rename, or "clean up" nearby code that wasn't part of the task, even if it looks like an improvement. Propose it separately.

## Tests

- Tests must check real behavior, not just that a function ran without error. Read the actual assertion, not just the test's name.
- Every bug fix ships with a regression test, confirmed to fail against the old code and pass against the fix. If you claim a test is a regression test, verify that claim before presenting it as done.
- Be cautious with mocking: don't mock away the exact behavior a test is supposed to verify.

## Security

- Any endpoint that reads or writes user data must check that the authenticated user actually owns that data, using the shared ownership-check pattern. Do not assume the frontend already filtered it.
- Every new route must be explicitly classified as public, user-session, or server-verified (e.g., webhook signature). Nothing ships unclassified or accidentally unauthenticated.
- Treat all client-supplied input (URL parameters, form data, request bodies, headers) as untrusted until validated through `lib/validation/`.
- Never put secrets in frontend code, logs, or client-facing error responses. Internal error detail goes to Sentry/logs only.
- Never use the Supabase service role key to work around a Row Level Security error. Diagnose why the policy is correctly blocking the query instead.

## Architecture

- Components: UI only. Services: business logic. Routes: thin, call services. Reuse existing identifiers (Stripe customer IDs, Supabase user IDs) rather than looking records up by fields like email that aren't guaranteed unique.
- No new database tables, new architectural complexity (queue, cache, separate service), or new dependencies without an explicit request — see `docs/adr/` for the reasoning behind past "no" decisions on exactly this kind of addition.

## Forbidden without explicit human approval

- Dropping a column or any other destructive/irreversible migration step.
- Adding a new dependency.
- Bypassing a shared ownership or validation helper with a custom inline check.
- Touching payment or webhook logic without flagging it for extra review.
- Using the Supabase service role key to bypass RLS.

## Before generating non-trivial code

Provide a short plan first: files affected, database impact, security impact, tests to be added, rollback implications. Wait for approval before writing code. For anything beyond a one-line fix, make sure requirements, scope, acceptance criteria, constraints, and non-goals are explicit rather than inferred.

## Documenting decisions

Document non-obvious business rules with a short comment at the point they're enforced, not just in a commit message. Significant architectural decisions get a short ADR in `docs/adr/` (title, status, context, decision, alternatives considered, consequences) — a page or less.
