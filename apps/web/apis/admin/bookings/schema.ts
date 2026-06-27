import { z } from "zod";

export const adminBookingStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "DISPUTE",
  "NONE_ARRIVAL",
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
});

export type AdminBookingStatus = z.infer<typeof adminBookingStatusSchema>;
export const ADMIN_BOOKING_STATUS_LABELS: Record<AdminBookingStatus, string> = {
  PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", CHECKED_IN: "Đã check-in",
  CHECKED_OUT: "Đã check-out", COMPLETED: "Hoàn tất", CANCELLED: "Khách hủy",
  REJECTED: "Nhà cung cấp từ chối", DISPUTE: "Đang khiếu nại", NONE_ARRIVAL: "Khách không đến",
};
export type DisputeResolutionData = z.infer<typeof disputeResolutionSchema>;
export type NoShowResolutionData = z.infer<typeof noShowResolutionSchema>;
export type BookingStatusOverrideData = z.infer<
  typeof bookingStatusOverrideSchema
>;
