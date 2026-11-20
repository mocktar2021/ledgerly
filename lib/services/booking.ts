// Booking business logic. Single source of truth for conflict checking —
// called from the booking creation route, the availability preview route
// (Chapter 62), and anywhere else that needs this rule. Never reimplement
// this check elsewhere; extend it here instead (Chapter 16).

import type { SupabaseClient } from "@supabase/supabase-js";

export interface CheckConflictInput {
  providerId: string;
  startTime: Date;
  endTime: Date;
  capacity?: number; // defaults to 1 (Chapter 16, group sessions)
  excludeBookingId?: string; // for checking an existing booking being edited
}

// Fixed in Chapter 73: compare stored UTC timestamps directly. The
// original bug converted both sides to the provider's local timezone
// before comparing, which introduced a fractional rounding discrepancy
// for timezones offset by something other than a whole number of hours.
// Two absolute UTC instants never need that conversion to be compared
// correctly.
export async function checkBookingConflict(
  supabase: SupabaseClient,
  input: CheckConflictInput
): Promise<{ hasConflict: boolean; existingCount: number }> {
  const capacity = input.capacity ?? 1;

  let query = supabase
    .from("bookings")
    .select("id, capacity")
    .eq("provider_id", input.providerId)
    .eq("status", "confirmed")
    .lt("start_time", input.endTime.toISOString())
    .gt("end_time", input.startTime.toISOString());

  if (input.excludeBookingId) {
    query = query.neq("id", input.excludeBookingId);
  }

  const { data: overlapping, error } = await query;
  if (error) throw error;

  const existingCount = (overlapping ?? []).length;
  const hasConflict = existingCount + 1 > capacity;

  return { hasConflict, existingCount };
}
