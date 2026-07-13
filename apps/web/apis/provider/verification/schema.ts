import { z } from "zod";

export const providerStatusLabels: Record<string, string> = {
  PENDING_VERIFICATION: "Đang chờ duyệt",
  VERIFIED: "Đã xác minh",
  REJECTED: "Bị từ chối",
  SUSPENDED: "Đang bị tạm ngưng",
};

export const providerStatusSchema = z.enum([
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
]);

export const providerDocumentTypeLabels: Record<string, string> = {
  business_license: "Giấy phép kinh doanh",
  id_card_front: "CCCD/CMND mặt trước",
  id_card_back: "CCCD/CMND mặt sau",
  tax_code: "Mã số thuế",
  other: "Tài liệu khác",
};

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

export const providerInfoSchema = z.object({
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
  providerStatus: providerStatusSchema,
  depositStatus: z.string(),
  depositBalance: z.number(),
  walletBalance: z.number(),
  cancellationRate: z.number(),
  adminNote: z.string().nullable(),
  createAt: z.string(),
  updateAt: z.string(),
});

export const providerRegistrationSchema = z.object({
  userName: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  businessName: z.string().min(1, "Tên cơ sở là bắt buộc"),
  description: z.string().optional(),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string().email("Email doanh nghiệp không hợp lệ"),
  address: z.string().min(1, "Địa chỉ cơ sở là bắt buộc"),
  taxCode: z.string().optional(),
  identityNumber: z.string().optional(),
  identityFullName: z.string().optional(),
  identityDob: z.string().optional(),
  identityAddress: z.string().optional(),
  bankCode: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
});

export const uploadProviderDocumentSchema = z.object({
  documentType: z.string().min(1),
  file: z.custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Ảnh tài liệu không hợp lệ",
  ),
});

export type ProviderInfo = z.infer<typeof providerInfoSchema>;
export type ProviderDocument = z.infer<typeof providerDocumentSchema>;
export type ProviderRegistrationData = z.infer<typeof providerRegistrationSchema>;
export type UploadProviderDocumentData = z.infer<typeof uploadProviderDocumentSchema>;
