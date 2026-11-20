// Generic Supabase client setup. No Ledgerly-specific logic lives here —
// see lib/services/ for that. Two clients are exported because they carry
// different levels of trust (Chapter 25, Chapter 60).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public/anon client: safe to use in server code that should respect the
// requesting user's own Row Level Security policies. This is the default
// choice for almost everything.
export function getSupabaseClient(accessToken?: string): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    accessToken
      ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
      : undefined
  );
}

// Service role client: bypasses Row Level Security entirely. Only for
// genuine administrative tasks that must see across every provider.
// Never reach for this to work around an RLS error — see AGENTS.md and
// Chapter 25 / Chapter 60.
export function getSupabaseServiceRoleClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
