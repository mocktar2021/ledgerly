// Shared test utilities. Integration and regression tests run against a
// real (local/test) Supabase instance, not mocks; these helpers create
// throwaway fixtures and clean up after themselves.

import { getSupabaseServiceRoleClient } from "@/lib/supabase";

export async function createTestProvider() {
  const supabase = getSupabaseServiceRoleClient();
  const email = `test-${crypto.randomUUID()}@example.com`;
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(),
  });
  if (authError || !authUser.user) throw authError;

  const { error } = await supabase
    .from("providers")
    .insert({ id: authUser.user.id, business_name: "Test Provider" });
  if (error) throw error;

  return { id: authUser.user.id, email };
}

export async function createTestClient(providerId: string) {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ provider_id: providerId, name: "Test Client", email: "client@example.com" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createTestBooking(options: { providerId: string }) {
  const supabase = getSupabaseServiceRoleClient();
  const client = await createTestClient(options.providerId);
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      provider_id: options.providerId,
      client_id: client.id,
      start_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cleanupTestProvider(providerId: string) {
  const supabase = getSupabaseServiceRoleClient();
  await supabase.from("bookings").delete().eq("provider_id", providerId);
  await supabase.from("clients").delete().eq("provider_id", providerId);
  await supabase.from("providers").delete().eq("id", providerId);
  await supabase.auth.admin.deleteUser(providerId);
}
