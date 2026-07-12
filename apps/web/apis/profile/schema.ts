import { z } from "zod";

export const profileRouteRoleSchema = z.enum(["admin", "provider"]);

export const profileRoleSchema = z.enum([
  "ADMIN",
  "PROVIDER",
  "CUSTOMER",
]);

export const profileStatusSchema = z.enum(["ACTIVE", "INACTIVE", "BANNED"]);

export const profileSchema = z.object({
  id: z.string().min(1),
  userName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  fullName: z.string().nullable(),
  avatar: z.string().nullable(),
  role: profileRoleSchema,
  status: profileStatusSchema.or(z.string()),
  providerProfileId: z.string().nullable().optional().default(null),
  providerStatus: z
    .enum([
      "PENDING_VERIFICATION",
      "VERIFIED",
      "REJECTED",
      "SUSPENDED",
    ])
    .nullable()
    .optional()
    .default(null),
  providerVerificationStatus: z
    .enum([
      "PENDING_VERIFICATION",
      "VERIFIED",
      "REJECTED",
      "SUSPENDED",
    ])
    .nullable()
    .optional()
    .default(null),
  createAt: z.string().min(1),
  updateAt: z.string().min(1),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
});

export type ProfileRouteRole = z.infer<typeof profileRouteRoleSchema>;
export type ProfileRole = z.infer<typeof profileRoleSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
