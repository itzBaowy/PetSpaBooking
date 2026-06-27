import { z } from "zod";

export const adminProviderStatusSchema = z.enum([
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
]);

export const providerDocumentSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  documentType: z.string(),
  imageUrl: z.string(),
  status: z.string(),
  adminNote: z.string().nullable().optional(),
  createAt: z.string(),
  updateAt: z.string(),
});

export const adminProviderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  businessName: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  taxCode: z.string().nullable().optional(),
  identityNumber: z.string().nullable().optional(),
  identityFullName: z.string().nullable().optional(),
  identityDob: z.string().nullable().optional(),
  identityAddress: z.string().nullable().optional(),
  bankCode: z.string().nullable().optional(),
  bankAccountNumber: z.string().nullable().optional(),
  bankAccountName: z.string().nullable().optional(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  providerStatus: adminProviderStatusSchema,
  depositStatus: z.string(),
  depositBalance: z.number(),
  walletBalance: z.number(),
  cancellationRate: z.number(),
  adminNote: z.string().nullable(),
  createAt: z.string(),
  updateAt: z.string(),
});

export const adminProviderDetailSchema = adminProviderSchema.extend({
  documents: z.array(providerDocumentSchema),
});

export const adminProviderListSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalItem: z.number(),
  totalPage: z.number(),
  items: z.array(adminProviderSchema),
});

export const adminProviderListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(10).default(10),
  search: z.string().optional(),
  providerStatus: adminProviderStatusSchema.optional(),
});

export const rejectProviderSchema = z.object({
  reason: z.string().min(1, "Vui lòng nhập lý do từ chối."),
});

export const suspendProviderSchema = z.object({
  reason: z.string().optional(),
});

export const providerStatusLabels: Record<AdminProviderStatus, string> = {
  PENDING_VERIFICATION: "Chờ duyệt",
  VERIFIED: "Đã xác thực",
  REJECTED: "Đã từ chối",
  SUSPENDED: "Tạm ngưng",
};

export const providerDocumentTypeLabels: Record<string, string> = {
  business_license: "Giấy phép kinh doanh",
  id_card_front: "CCCD/CMND mặt trước",
  id_card_back: "CCCD/CMND mặt sau",
  tax_code: "Mã số thuế",
  other: "Tài liệu khác",
};

export type AdminProviderStatus = z.infer<typeof adminProviderStatusSchema>;
export type AdminProvider = z.infer<typeof adminProviderSchema>;
export type AdminProviderDetail = z.infer<typeof adminProviderDetailSchema>;
export type AdminProviderList = z.infer<typeof adminProviderListSchema>;
export type AdminProviderListParams = z.infer<typeof adminProviderListParamsSchema>;
export type ProviderDocument = z.infer<typeof providerDocumentSchema>;
export type RejectProviderData = z.infer<typeof rejectProviderSchema>;
export type SuspendProviderData = z.infer<typeof suspendProviderSchema>;
