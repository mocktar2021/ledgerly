// Stripe webhook handler (see Chapter 44). Server-verified route (Ch34):
// no user session, authenticated instead via Stripe's signature.
//
// Handles: signature verification, duplicate delivery (idempotent via
// event.id), and event ordering (always re-syncs current state from
// Stripe rather than trusting a single event payload as final truth).

import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { apiError } from "@/lib/api-error";
import { wasEventProcessed, recordEventProcessed } from "@/lib/services/webhookEvents";
import { syncSubscriptionStatusFromStripe } from "@/lib/services/subscriptions";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    // Signature check failed. Never process an unverified payload.
    return apiError(400, "Invalid signature", err);
  }

  // Stripe does not guarantee exactly-once delivery. Treat a repeat as
  // routine, not an error: skip the work, still acknowledge success.
  if (await wasEventProcessed(event.id)) {
    return Response.json({ received: true });
  }

  switch (event.type) {
    case "invoice.payment_failed":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const customerId = (event.data.object as { customer: string }).customer;
      // Re-fetch current state from Stripe rather than trusting this
      // event's payload alone, so out-of-order delivery can't leave
      // Ledgerly in a stale or incorrect status. Service role client:
      // this route has no user session to scope an RLS-respecting
      // client to (Chapter 34's server-verified route category).
      await syncSubscriptionStatusFromStripe(getSupabaseServiceRoleClient(), customerId);
      break;
    }
    default:
      // Unhandled event types are acknowledged, not treated as errors.
      break;
  }

  await recordEventProcessed(event.id);
  return Response.json({ received: true });
}
