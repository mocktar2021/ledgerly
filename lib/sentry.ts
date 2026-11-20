// Error tracking (Chapter 47). Captures full internal detail for errors
// that never reach the client — see lib/api-error.ts, which is the only
// place that should be calling logToSentry directly on ordinary requests.

import * as Sentry from "@sentry/nextjs";

let initialized = false;

function ensureInitialized() {
  if (initialized) return;
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  });
  initialized = true;
}

// Captures internal error detail (Chapter 33: never sent to the client),
// tagged with whatever request context is available so it can be
// cross-referenced with structured logs (Chapter 46, Chapter 49).
export function logToSentry(error: unknown, context?: Record<string, unknown>) {
  ensureInitialized();
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
