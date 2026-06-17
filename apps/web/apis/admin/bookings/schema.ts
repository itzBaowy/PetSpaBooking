import { z } from "zod";

export const adminBookingStatusSchema = z.enum([
  "BOOKED",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_SERVICE",
  "COMPLETED",
  "COMMISSION_CHARGED",
  "CANCELLED_BY_CUSTOMER",
  "CANCELLED_BY_PROVIDER",
  "NO_SHOW_REPORTED",
  "DISPUTED",
  "FAILED_APPROVED",
]);

export const disputeResolutionSchema = z.object({
  disputeId: z.string().min(1),
  result: z.enum(["REFUND", "CLOSE_CLAIM", "UPDATE_BOOKING_STATUS"]),
  bookingStatus: adminBookingStatusSchema.optional(),
  refundAmount: z.number().min(0).optional(),
  auditNote: z.string().min(10),
});

export const noShowResolutionSchema = z.object({
  bookingId: z.string().min(1),
  decision: z.enum(["APPROVE_NO_SHOW", "REJECT_TO_DISPUTE", "REJECT_TO_COMPLETED"]),
  evidenceNote: z.string().min(10),
  auditNote: z.string().min(10),
});

export const bookingStatusOverrideSchema = z.object({
  bookingId: z.string().min(1),
  status: adminBookingStatusSchema,
  reason: z.string().min(10),
  adminId: z.string().min(1),
});

export type AdminBookingStatus = z.infer<typeof adminBookingStatusSchema>;
export type DisputeResolutionData = z.infer<typeof disputeResolutionSchema>;
export type NoShowResolutionData = z.infer<typeof noShowResolutionSchema>;
export type BookingStatusOverrideData = z.infer<
  typeof bookingStatusOverrideSchema
>;
