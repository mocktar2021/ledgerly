// Webhook idempotency (Chapter 44). Stripe does not guarantee exactly-once
// delivery, so every event ID gets recorded once processed, and a repeat
// delivery is treated as routine, not an error.

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

// This runs on the server-verified webhook route (Chapter 34), which has
// no user session to derive an authenticated client from. The service
// role client is appropriate here specifically because this table has no
// per-user ownership concept; it's a system-level dedupe log, not user
// data (contrast with Chapter 25 / Chapter 60's warning against reaching
// for the service role key to bypass a legitimate RLS error).
function client(): SupabaseClient {
  return getSupabaseServiceRoleClient();
}

export async function wasEventProcessed(eventId: string): Promise<boolean> {
  const { data, error } = await client()
    .from("processed_webhook_events")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

export async function recordEventProcessed(eventId: string): Promise<void> {
  const { error } = await client()
    .from("processed_webhook_events")
    .insert({ event_id: eventId, processed_at: new Date().toISOString() });

  if (error) throw error;
}
