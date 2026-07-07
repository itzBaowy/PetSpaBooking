import { z } from "zod";

export const adminUserRoleSchema = z.enum(["CUSTOMER", "ADMIN", "PROVIDER"]);
export const adminUserStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "BANNED",
]);

export const adminUserPetSchema = z.object({
  id: z.string(),
  name: z.string(),
  breed: z.string(),
  gender: z.string(),
  ageLabel: z.string(),
  imageUrl: z.string(),
  status: z.string(),
  weight: z.string(),
  height: z.string(),
  color: z.string(),
  criticalNote: z.string().nullable(),
  nextVaccineDate: z.string().nullable(),
  photos: z.array(z.string()),
  createAt: z.string(),
  updateAt: z.string(),
});

export const adminUserCustomerSchema = z.object({
  id: z.string(),
  location: z.string(),
  pets: z.array(adminUserPetSchema),
});

export const adminUserSchema = z.object({
  id: z.string(),
  userName: z.string(),
  email: z.string(),
  phone: z.string(),
  fullName: z.string().nullable(),
  avatar: z.string().nullable(),
  role: adminUserRoleSchema,
  status: adminUserStatusSchema,
  createAt: z.string(),
  updateAt: z.string(),
  customers: adminUserCustomerSchema.nullable().optional(),
});

export const adminUserListSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalItem: z.number(),
  totalPage: z.number(),
  items: z.array(adminUserSchema),
});

export const adminUserListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(10).default(10),
  search: z.string().optional(),
  role: adminUserRoleSchema.optional(),
  status: adminUserStatusSchema.optional(),
});

export const adminUserPayloadSchema = z.object({
  userName: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  fullName: z.string().optional(),
  avatar: z.string().optional(),
  role: adminUserRoleSchema.default("CUSTOMER"),
  status: adminUserStatusSchema.default("ACTIVE"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").optional(),
});

export const updateAdminUserPayloadSchema = adminUserPayloadSchema.partial();

export const updateAdminUserRoleSchema = z.object({
  role: adminUserRoleSchema,
});

export const adminAccountRoleSchema = z.enum([
  "CUSTOMER",
  "PROVIDER",
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
    reason: z.string().min(5, "Lý do phải có ít nhất 5 ký tự."),
    durationType: z.enum(["TEMPORARY", "PERMANENT"]),
    durationDays: z.number().int().positive().optional(),
  })
  .superRefine((value, context) => {
    if (value.durationType === "TEMPORARY" && !value.durationDays) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Khóa tạm thời cần nhập số ngày.",
        path: ["durationDays"],
      });
    }
  });

export const roleLabels: Record<AdminUserRole, string> = {
  CUSTOMER: "Khách hàng",
  PROVIDER: "Nhà cung cấp",
  ADMIN: "Quản trị viên",
};

export const statusLabels: Record<AdminUserStatus, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
  BANNED: "Bị cấm",
};

export type AdminUserRole = z.infer<typeof adminUserRoleSchema>;
export type AdminUserStatus = z.infer<typeof adminUserStatusSchema>;
export type AdminUserPet = z.infer<typeof adminUserPetSchema>;
export type AdminUserCustomer = z.infer<typeof adminUserCustomerSchema>;
export type AdminUser = z.infer<typeof adminUserSchema>;
export type AdminUserList = z.infer<typeof adminUserListSchema>;
export type AdminUserListParams = z.infer<typeof adminUserListParamsSchema>;
export type AdminUserPayload = z.infer<typeof adminUserPayloadSchema>;
export type UpdateAdminUserPayload = z.infer<
  typeof updateAdminUserPayloadSchema
>;
export type UpdateAdminUserRolePayload = z.infer<
  typeof updateAdminUserRoleSchema
>;
export type AdminAccountRole = z.infer<typeof adminAccountRoleSchema>;
export type AdminAccountStatus = z.infer<typeof adminAccountStatusSchema>;
export type ProviderType = z.infer<typeof providerTypeSchema>;
export type ProviderVerificationStatus = z.infer<
  typeof providerVerificationStatusSchema
>;
export type AccountStatusActionData = z.infer<
  typeof accountStatusActionSchema
>;
