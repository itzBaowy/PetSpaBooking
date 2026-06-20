import { z } from "zod";

export const commissionStatusSchema = z.enum([
  "PENDING",
  "CHARGED",
  "RELEASED",
  "FAILED",
]);

export const commissionConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Config name is required."),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  scope: z.enum(["GLOBAL", "SERVICE_CATEGORY", "PROVIDER_TYPE"]),
  scopeValue: z.string().min(1, "Scope value is required."),
  value: z.number().positive("Commission value must be positive."),
  effectiveFrom: z.string().min(1, "Effective date is required."),
  appliesToNewBookingsOnly: z.literal(true),
  isActive: z.boolean(),
});

export type CommissionConfigData = z.infer<typeof commissionConfigSchema>;
