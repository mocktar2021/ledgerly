// Client business logic. Extracted from the dashboard component in
// Chapter 17's incremental refactor, unchanged in behavior, just moved
// to where it belongs (Chapter 15's structure).

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getClientsForProvider(supabase: SupabaseClient, providerId: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, email, phone, created_at")
    .eq("provider_id", providerId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

// Client search (Chapter 57). Parameterized query via Supabase's query
// builder — never string-concatenated — so a search term can never be
// interpreted as anything other than the text it is.
export async function searchClients(
  supabase: SupabaseClient,
  providerId: string,
  searchTerm: string
) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, email, phone")
    .eq("provider_id", providerId)
    .ilike("name", `%${searchTerm}%`)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

// Repeat-client analytics (Chapter 29). Single aggregate query, grouped
// by client_id (not name — see Chapter 26/27/28), instead of the
// original N+1 loop.
export async function getRepeatClients(supabase: SupabaseClient, providerId: string) {
  const { data, error } = await supabase.rpc("get_repeat_clients", {
    p_provider_id: providerId,
  });

  if (error) throw error;
  return data;
}
