// Health check (Chapter 48). Confirms the app and its critical
// dependencies are actually working; used by the deployment platform to
// decide whether a new deploy is healthy, and by uptime monitoring.
// Deliberately lightweight and public: no user data, no secrets.

import { getSupabaseServiceRoleClient } from "@/lib/supabase";

export async function GET() {
  const checks: Record<string, "ok" | "fail"> = {};

  try {
    const supabase = getSupabaseServiceRoleClient();
    const { error } = await supabase.from("providers").select("id").limit(1);
    checks.database = error ? "fail" : "ok";
  } catch {
    checks.database = "fail";
  }

  const healthy = Object.values(checks).every((status) => status === "ok");

  return Response.json(
    { status: healthy ? "healthy" : "unhealthy", checks },
    { status: healthy ? 200 : 503 }
  );
}
