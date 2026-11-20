// Generic Stripe client setup. No Ledgerly-specific business logic here;
// see lib/services/subscriptions.ts for that.

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Verified current as of publication-time check (Sept 2026). Re-check
  // against https://docs.stripe.com/api/versioning before relying on
  // this; Stripe ships a new dated API version roughly monthly.
  apiVersion: "2026-08-26.dahlia",
});
