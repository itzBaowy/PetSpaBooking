import { z } from "zod";

export const adminAccountRoleSchema = z.enum([
  "PET_OWNER",
  "SERVICE_PROVIDER",
  "ADMIN",
]);

export const adminAccountStatusSchema = z.enum(["ACTIVE", "SUSPENDED"]);

export const providerTypeSchema = z.enum([
  "CLINIC",
  "GROOMING",
  "PET_HOTEL",
  "SPA",
]);

export const providerVerificationStatusSchema = z.enum([
  "VERIFIED",
  "PENDING",
  "REJECTED",
]);

export const accountStatusActionSchema = z
  .object({
    accountId: z.string().min(1),
    role: adminAccountRoleSchema,
    status: adminAccountStatusSchema,
    reason: z.string().min(5, "Reason must be at least 5 characters."),
    durationType: z.enum(["TEMPORARY", "PERMANENT"]),
    durationDays: z.number().int().positive().optional(),
  })
  .superRefine((value, context) => {
    if (value.durationType === "TEMPORARY" && !value.durationDays) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Temporary ban requires a duration.",
        path: ["durationDays"],
      });
    }
  });

export type AdminAccountRole = z.infer<typeof adminAccountRoleSchema>;
export type AdminAccountStatus = z.infer<typeof adminAccountStatusSchema>;
export type ProviderType = z.infer<typeof providerTypeSchema>;
export type ProviderVerificationStatus = z.infer<
  typeof providerVerificationStatusSchema
>;
export type AccountStatusActionData = z.infer<
  typeof accountStatusActionSchema
>;
