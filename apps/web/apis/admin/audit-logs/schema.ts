import { z } from "zod";

export const auditLogFilterSchema = z.object({
  actorRole: z
    .enum(["ADMIN", "PET_OWNER", "SERVICE_PROVIDER"])
    .optional(),
  actionType: z
    .enum([
      "CONTENT_APPROVED",
      "CONTENT_HIDDEN",
      "REPORT_RESOLVED",
      "DISPUTE_REFUNDED",
      "BOOKING_STATUS_UPDATED",
      "ACCOUNT_LOCKED",
    ])
    .optional(),
  keyword: z.string().optional(),
});

export type AuditLogFilterData = z.infer<typeof auditLogFilterSchema>;
