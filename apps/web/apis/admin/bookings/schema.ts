import { z } from "zod";

export const adminBookingStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const disputeResolutionSchema = z.object({
  disputeId: z.string().min(1),
  result: z.enum(["REFUND", "CLOSE_CLAIM", "UPDATE_BOOKING_STATUS"]),
  bookingStatus: adminBookingStatusSchema.optional(),
  refundAmount: z.number().min(0).optional(),
  auditNote: z.string().min(10),
});

export type AdminBookingStatus = z.infer<typeof adminBookingStatusSchema>;
export type DisputeResolutionData = z.infer<typeof disputeResolutionSchema>;
