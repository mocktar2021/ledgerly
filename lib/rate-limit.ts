// Rate limiting, backed by shared storage (Chapter 60 fix). The original
// version used an in-memory counter, which looked correct and passed
// manual testing but didn't actually work: each of Vercel's stateless
// function instances kept its own separate counter starting from zero.
// This version persists counts somewhere every instance can see.

import { getSupabaseServiceRoleClient } from "@/lib/supabase";

interface RateLimitOptions {
  max: number;
  windowSeconds: number;
}

// key should identify what's being limited, e.g. `sms:${bookingId}` or
// `login:${ip}`. Returns true if the action is allowed, false if the
// limit has been hit.
export async function checkRateLimit(key: string, options: RateLimitOptions): Promise<boolean> {
  const supabase = getSupabaseServiceRoleClient();
  const windowStart = new Date(Date.now() - options.windowSeconds * 1000).toISOString();

  const { count, error } = await supabase
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", windowStart);

  if (error) throw error;
  if ((count ?? 0) >= options.max) return false;

  const { error: insertError } = await supabase
    .from("rate_limit_events")
    .insert({ key, created_at: new Date().toISOString() });

  if (insertError) throw insertError;
  return true;
}
