// Shared ownership-check pattern (Chapter 23). Every route that fetches
// a single user-owned record by ID should go through one of these,
// rather than writing its own ad hoc check. Mismatched ownership and a
// genuinely missing record return the identical NotFoundError, so a
// caller can't learn which ID values are valid by probing (Chapter 23's
// "don't reveal which case it is" nuance).

import type { SupabaseClient } from "@supabase/supabase-js";

export class NotFoundError extends Error {}

export async function getOwnedBookingOrThrow(
  supabase: SupabaseClient,
  bookingId: string,
  requestingProviderId: string
) {
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (error || !booking || booking.provider_id !== requestingProviderId) {
    throw new NotFoundError("Booking not found");
  }
  return booking;
}

export async function getOwnedSubscriptionOrThrow(
  supabase: SupabaseClient,
  subscriptionId: string,
  requestingProviderId: string
) {
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .single();

  if (error || !subscription || subscription.provider_id !== requestingProviderId) {
    throw new NotFoundError("Subscription not found");
  }
  return subscription;
}
