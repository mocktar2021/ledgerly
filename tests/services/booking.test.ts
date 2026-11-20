// Unit test (Chapter 37): checks checkBookingConflict in isolation, no
// real database — a fast, fake Supabase client stands in, since the
// logic under test is the comparison, not the storage.

import { describe, it, expect, vi } from "vitest";
import { checkBookingConflict } from "@/lib/services/booking";

function fakeSupabase(existingBookings: Array<{ id: string; capacity: number }>) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            lt: () => ({
              gt: () => Promise.resolve({ data: existingBookings, error: null }),
            }),
          }),
        }),
      }),
    }),
  } as any;
}

describe("checkBookingConflict", () => {
  it("reports no conflict when the slot is free", async () => {
    const supabase = fakeSupabase([]);
    const result = await checkBookingConflict(supabase, {
      providerId: "provider-1",
      startTime: new Date("2026-09-01T15:00:00Z"),
      endTime: new Date("2026-09-01T16:00:00Z"),
    });
    expect(result.hasConflict).toBe(false);
  });

  it("reports a conflict when capacity is already full", async () => {
    const supabase = fakeSupabase([{ id: "existing-1", capacity: 1 }]);
    const result = await checkBookingConflict(supabase, {
      providerId: "provider-1",
      startTime: new Date("2026-09-01T15:00:00Z"),
      endTime: new Date("2026-09-01T16:00:00Z"),
      capacity: 1,
    });
    expect(result.hasConflict).toBe(true);
  });

  it("allows a group session booking under capacity", async () => {
    const supabase = fakeSupabase([{ id: "existing-1", capacity: 5 }]);
    const result = await checkBookingConflict(supabase, {
      providerId: "provider-1",
      startTime: new Date("2026-09-01T15:00:00Z"),
      endTime: new Date("2026-09-01T16:00:00Z"),
      capacity: 5,
    });
    expect(result.hasConflict).toBe(false);
  });

  // Regression test for the Chapter 71-73 timezone bug: a booking ending
  // at exactly HH:00 immediately followed by one starting at that same
  // HH:00 must never conflict, regardless of the provider's timezone,
  // because the comparison now uses direct UTC instants rather than an
  // intermediate local-timezone conversion.
  it("does not conflict for back-to-back bookings at an exact hour boundary", async () => {
    const supabase = fakeSupabase([]); // the prior booking ends exactly when this one starts
    const result = await checkBookingConflict(supabase, {
      providerId: "provider-1",
      startTime: new Date("2026-09-01T20:00:00.000Z"),
      endTime: new Date("2026-09-01T21:00:00.000Z"),
    });
    expect(result.hasConflict).toBe(false);
  });
});
