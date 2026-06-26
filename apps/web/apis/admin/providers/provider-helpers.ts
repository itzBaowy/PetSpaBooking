import {
  providerStatusLabels,
  type AdminProvider,
  type AdminProviderStatus,
} from "./schema";

export const providerStatusFilterOptions: Array<{
  label: string;
  value: "" | AdminProviderStatus;
}> = [
  { label: "Tất cả trạng thái", value: "" },
  { label: providerStatusLabels.PENDING_VERIFICATION, value: "PENDING_VERIFICATION" },
  { label: providerStatusLabels.VERIFIED, value: "VERIFIED" },
  { label: providerStatusLabels.REJECTED, value: "REJECTED" },
  { label: providerStatusLabels.SUSPENDED, value: "SUSPENDED" },
];

export function getProviderInitial(provider: AdminProvider) {
  return provider.businessName.charAt(0).toUpperCase();
}

export function getApproveConfirmMessage(provider: AdminProvider) {
  return `Duyệt hồ sơ nhà cung cấp ${provider.businessName}?`;
}

export function getSuspendPromptMessage(provider: AdminProvider) {
  return `Nhập lý do tạm ngưng ${provider.businessName}:`;
}

export function countProvidersByStatus(
  providers: AdminProvider[],
  status: AdminProviderStatus,
) {
  return providers.filter((provider) => provider.providerStatus === status).length;
}
