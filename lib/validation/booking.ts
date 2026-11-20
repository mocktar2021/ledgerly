import { z } from "zod";

// Server-side authority for what a valid booking request looks like.
// Referenced from api/bookings routes before any service is called.
// The client-side calendar widget preventing past-date selection is a
// convenience only; this schema is the actual enforcement (see Chapter 32).

export const createBookingSchema = z
  .object({
    clientId: z.string().uuid(),
    startTime: z.coerce.date().refine((d) => d > new Date(), {
      message: "startTime must be in the future",
    }),
    endTime: z.coerce.date(),
    capacity: z.number().int().positive().default(1),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
