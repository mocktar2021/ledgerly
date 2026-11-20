# Ledgerly

Booking, invoicing, and client management for solo freelance service providers (coaches, tutors, consultants). Providers manage clients and bookings, offer individual or group sessions, run a waitlist, take payments and subscriptions, and share a public booking page clients can book from directly.

This repository is the companion project for *Engineering for Vibe Coders* by Alex Sterling. It started as a realistic, imperfect AI-generated MVP (Chapter 1) and has been hardened chapter by chapter into a production-oriented application, with every real incident, fix, and decision documented as it happened.

## What's here

- Provider accounts, authentication, and dashboard
- Client management (CRUD, search)
- Individual and group session bookings, with a waitlist and buffer-time/capacity rules
- Public booking page per provider, with a live availability preview and profile photo
- Subscription billing and one-off invoice payments via Stripe (checkout, webhooks, full lifecycle handling)
- Email and SMS reminders
- Booking history export (CSV)
- Structured logging, error tracking, and metrics (see `docs/adr/` for the observability approach)

## Stack

- Next.js (App Router) + TypeScript
- PostgreSQL via Supabase (Auth + Row Level Security)
- Zod for request validation
- Stripe (checkout, subscriptions, webhooks)
- Resend (or equivalent) for email, a third-party API for SMS
- Vercel (hosting, preview environments, CI/CD via GitHub Actions)
- Sentry (error tracking)
- Vitest (unit/integration tests), Playwright (end-to-end tests)

## Getting started

```
npm install
cp .env.example .env.local   # fill in Supabase, Stripe, SMS, and email keys
npm run dev
```

## Testing

```
npm test           # unit and integration tests (Vitest)
npm run test:e2e   # end-to-end tests (Playwright)
npm run typecheck  # TypeScript
```

## Where to go for more

- **`AGENTS.md`** — conventions this project expects AI coding agents (and humans) to follow: project structure, working rules, style, testing, security, and what requires explicit approval before an agent should attempt it. Read this before making any change.
- **`docs/adr/`** — architecture decision records explaining *why* specific choices were made (data model, stack, structural decisions), not just what the current code does. Check here before re-deciding something that was already decided.
- **`database/migrations/`** — every schema change, in order, with comments explaining staged/irreversible steps. `database/schema.sql` is a readable current-state snapshot.
- **`TROUBLESHOOTING.md`** — the incident response runbook. Start here when something's reported broken.

## About the book

*Engineering for Vibe Coders: Turn AI-Generated Apps Into Reliable, Secure, Production-Ready Software* by Alex Sterling. This repository grows alongside the manuscript, chapter by chapter, and reflects real incidents the book walks through in detail.
