# ADR 0002: Do not add a dedicated queue system

**Status:** Accepted (Chapter 63)

## Context

Background work (email/SMS reminders, notifications) could be handled by a dedicated queue infrastructure: a message broker or managed queue service, with its own deployment, monitoring, and ongoing operational cost.

## Decision

Use lightweight, non-blocking deferred execution for background work, with no separate queue infrastructure, at current scale.

## Alternatives considered

- **A full managed queue service.** Rejected: current reminder volume doesn't justify the operational cost. Neither incident that motivated considering one (the Chapter 35 reminder duplication or the Chapter 60 rate limiter failure) would actually have been prevented by heavier queue infrastructure rather than the specific fixes already applied (idempotency check; shared/persisted rate limit counter).

## Consequences

- Simpler to operate for now: no additional infrastructure to monitor or pay for.
- **Revisit this decision if:** Part XII metrics (error rate, latency, delivery reliability on the reminder path) show real, measurable timeouts or unreliable delivery under actual load, not based on a general sense that the app has "grown enough" to deserve one.
