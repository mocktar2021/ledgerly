// Shared error response helper for all API routes (see Chapter 33).
// Full error detail is logged internally; only a safe, limited message
// ever leaves the server in the response body.

import { logToSentry } from "@/lib/sentry";

export function apiError(status: number, message: string, internalDetail?: unknown) {
  if (internalDetail) {
    logToSentry(internalDetail);
  }
  return Response.json({ error: { message } }, { status });
}

// Usage in a route:
//   const parsed = createBookingSchema.safeParse(body);
//   if (!parsed.success) {
//     return apiError(400, parsed.error.issues[0]?.message ?? "Invalid request");
//   }
//   try {
//     ...
//   } catch (err) {
//     return apiError(500, "Something went wrong. Please try again.", err);
//   }
