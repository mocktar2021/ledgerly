// Regression test for Chapter 1's original bug (Dana's booking).
// Confirmed to fail against the pre-Chapter-23 code (no ownership check
// at all) and to pass against the current getOwnedBookingOrThrow
// implementation, per Chapter 38's discipline: no bug fix ships without
// a test proving it stays fixed.

import { describe, it, expect, afterAll } from "vitest";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import { getOwnedBookingOrThrow, NotFoundError } from "@/lib/services/ownership";
import { createTestProvider, createTestBooking, cleanupTestProvider } from "../helpers";

describe("regression: a provider cannot fetch another provider's booking", () => {
  const createdProviderIds: string[] = [];

  afterAll(async () => {
    for (const id of createdProviderIds) {
      await cleanupTestProvider(id);
    }
  });

  it("throws NotFoundError instead of returning the booking", async () => {
    const providerA = await createTestProvider();
    const providerB = await createTestProvider();
    createdProviderIds.push(providerA.id, providerB.id);

    const booking = await createTestBooking({ providerId: providerB.id });
    const supabase = getSupabaseServiceRoleClient();

    await expect(
      getOwnedBookingOrThrow(supabase, booking.id, providerA.id)
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("still allows the owning provider to fetch their own booking", async () => {
    const provider = await createTestProvider();
    createdProviderIds.push(provider.id);

    const booking = await createTestBooking({ providerId: provider.id });
    const supabase = getSupabaseServiceRoleClient();

    const fetched = await getOwnedBookingOrThrow(supabase, booking.id, provider.id);
    expect(fetched.id).toBe(booking.id);
  });
});
