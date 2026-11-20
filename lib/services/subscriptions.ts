// Subscription business logic. Single source of truth for subscription
// state — called from the checkout route and the Stripe webhook handler
// (Chapter 44), so both entry points stay in agreement.

import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

// Re-syncs Ledgerly's local subscription_status from Stripe's current
// state, rather than trusting a single webhook event's payload as final
// (Chapter 44's event-ordering fix).
export async function syncSubscriptionStatusFromStripe(
  supabase: SupabaseClient,
  stripeCustomerId: string
): Promise<void> {
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    limit: 1,
  });

  const current = subscriptions.data[0];
  const status = current ? current.status : "canceled";

  const { error } = await supabase
    .from("subscriptions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) throw error;
}

// Cancels a subscription, verifying ownership first (Chapter 22 fix —
// the subscription ID must belong to the requesting session's user, not
// just be trusted from the request).
export async function cancelSubscription(
  supabase: SupabaseClient,
  subscriptionId: string,
  requestingUserId: string
): Promise<void> {
  const { data: subscription, error: lookupError } = await supabase
    .from("subscriptions")
    .select("id, provider_id, stripe_subscription_id")
    .eq("id", subscriptionId)
    .single();

  if (lookupError || !subscription || subscription.provider_id !== requestingUserId) {
    // Same shape as getOwnedBookingOrThrow (Chapter 23): mismatched
    // ownership and missing record return identical errors.
    throw new NotFoundError("Subscription not found");
  }

  // Cancel at period end, per the billing-period business rule
  // established in Chapter 9.
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  const { error: updateError } = await supabase
    .from("subscriptions")
    .update({ status: "canceling", updated_at: new Date().toISOString() })
    .eq("id", subscriptionId);

  if (updateError) throw updateError;
}

export class NotFoundError extends Error {}
