# Troubleshooting

The incident workflow from Chapter 49, written down so it survives past the chapter that taught it. Follow these steps in order when something is reported broken, whether the report is specific or as vague as "the app isn't working."

## 1. Check availability

Before anything else, confirm the app itself is actually up.

```
curl https://ledgerly.example.com/api/health
```

A `200` with `"status": "healthy"` rules out a total outage. Move to step 2. A `503` or no response at all means the problem is broader than a single feature — check the Vercel deployment status and recent deploys first.

## 2. Check error tracking

Open Sentry and look for anything in the relevant timeframe, especially anything grouped as a new issue. Read the stack trace and the attached context (request ID, provider ID) before doing anything else.

## 3. Check metrics for a trend, not just an event

Look at error rate and p95/p99 latency for the affected route over the last few days, not just the last few minutes. A single alert-worthy spike is different from a slow, gradual climb that only just crossed a threshold — the second one usually means the underlying cause has been present longer than the alert suggests.

## 4. Search structured logs by request or provider ID

Once you have a rough time window and an affected route, search logs for the specific request ID from step 2, or the provider ID from the original report, to reconstruct exactly what happened, in order.

## 5. Decide: roll back or keep debugging live?

If something is **actively broken and harmful right now** (a payment failing, data being corrupted, a security boundary not holding), roll back immediately. Do not attempt to fix it live in production. See "Rollback" below.

If the issue is understood, contained, and not actively harmful (a cosmetic bug, a rare edge case with no ongoing damage), it's fine to continue investigating calmly without rolling back first.

## 6. Fix the cause, write a regression test, redeploy normally

Once you understand the actual root cause (not just the symptom — see Chapter 73), write a test that fails against the current code and passes against your fix (Chapter 38). Ship the fix through the normal pipeline, not as a rushed manual change.

---

## Rollback

```
# Via Vercel dashboard: Deployments → select last known-good deployment → Promote to Production
# Or via CLI:
vercel rollback
```

This is fast (near-instant) because it points traffic at an already-built deployment rather than rebuilding anything.

**Important:** rollback only reverts application code, not database changes. If the incident involved a migration, check whether that migration was additive (safe to leave in place) or destructive (see `database/migrations/` — destructive steps are commented and sequenced last, specifically so this situation is rare). Do not run a destructive migration in reverse without deliberately planning it — see AGENTS.md's forbidden-changes list.

## Who to contact

Update this section for your team. For a solo operator: you are the on-call contact. If you are unreachable for an extended period, [document your actual backup plan here — even "no backup exists yet, this is accepted risk at current scale" is a more honest and useful entry than leaving this blank].
