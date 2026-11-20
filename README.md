# Ledgerly

Booking, invoicing, and client management for solo freelance service providers (coaches, tutors, consultants). Providers manage clients and bookings, offer individual or group sessions, run a waitlist, take payments and subscriptions, and share a public booking page clients can book from directly.

This repository is the companion project for *Engineering for Vibe Coders* by Alex Sterling. It started as a realistic, imperfect AI-generated MVP (Chapter 1) and has been hardened chapter by chapter into a production-oriented application, with every real incident, fix, and decision documented as it happened.

## What's here

This repository holds the engineering layer the book builds: the services, API handlers, database migrations, tests, and operational docs. It does not include the UI (no `app/` or `components/` folder), so bring your own pages and wire them to these services.

- `lib/services/`: business rules for bookings, clients, ownership checks, subscriptions, and webhook deduplication
- `lib/validation/`: Zod schemas for request input
- `lib/`: Supabase and Stripe clients, structured logger, Sentry setup, API error handling, rate limiting
- `api/`: a health check and the Stripe webhook handler
- `database/migrations/`: seven migrations, including Row Level Security and a staged column move; `database/schema.sql` is the current-state snapshot
- `tests/`: unit tests, a regression test for the Chapter 1 ownership bug, and a Playwright end-to-end flow
- `.github/workflows/ci.yml`: the CI/CD pipeline from Chapter 52
- `docs/adr/`, `AGENTS.md`, `TROUBLESHOOTING.md`: decisions, agent rules, and the incident runbook

The book also covers features whose code is not included here, such as the provider dashboard, the public booking page, and email/SMS reminders.

## Stack

- Next.js (App Router) + TypeScript
- PostgreSQL via Supabase (Auth + Row Level Security)
- Zod for request validation
- Stripe (checkout, subscriptions, webhooks)
- Sentry (error tracking)
- Vitest (unit/integration tests), Playwright (end-to-end tests)
- GitHub Actions for CI, Vercel for hosting

## Getting started

```
npm ci
npm run typecheck
npx vitest run tests/services   # unit tests, no database needed
```

To run the full suite, create a non-production Supabase project, apply `database/migrations/` in order, then:

```
cp .env.example .env.local   # fill in test Supabase and Stripe values
npm test                     # unit, integration, and regression tests
```

`npm run dev` and `npm run test:e2e` need a UI in `app/`, which you add yourself.

## CI

Without the `TEST_SUPABASE_*` repository secrets, CI runs the type check and the unit tests and skips the database tests with a notice. Add the secrets (Settings > Secrets and variables > Actions) to run the full suite.

## Where to go for more

- **`AGENTS.md`**: conventions this project expects AI coding agents (and humans) to follow: project structure, working rules, style, testing, security, and what requires explicit approval before an agent should attempt it. Read this before making any change.
- **`docs/adr/`**: architecture decision records explaining *why* specific choices were made (data model, stack, structural decisions), not just what the current code does. Check here before re-deciding something that was already decided.
- **`database/migrations/`**: every schema change, in order, with comments explaining staged/irreversible steps. `database/schema.sql` is a readable current-state snapshot.
- **`TROUBLESHOOTING.md`**: the incident response runbook. Start here when something's reported broken.

## About the book

*Engineering for Vibe Coders: Turn AI-Generated Apps Into Reliable, Secure, Production-Ready Software* by Alex Sterling. This repository grows alongside the manuscript, chapter by chapter, and reflects real incidents the book walks through in detail.
