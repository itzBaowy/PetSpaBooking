"use client";

import { useConfirmDialog, useToast } from "@/components/ui/feedback-provider";
import {
  useAdminProvider,
  useApproveProvider,
  useRejectProvider,
  useSuspendProvider,
} from "../queries";
import {
  getApproveConfirmMessage,
  getSuspendPromptMessage,
} from "../provider-helpers";

export function useAdminProviderDetail(providerId: string) {
  const confirm = useConfirmDialog();
  const { showToast } = useToast();
  const providerQuery = useAdminProvider(providerId);
  const approveMutation = useApproveProvider();
  const rejectMutation = useRejectProvider();
  const suspendMutation = useSuspendProvider();
  const provider = providerQuery.data;

  async function approveProvider() {
    if (!provider) return;

    const result = await confirm({
      title: "Duyệt nhà cung cấp",
      description: getApproveConfirmMessage(provider),
      confirmLabel: "Duyệt hồ sơ",
      cancelLabel: "Hủy",
      tone: "success",
    });
    if (!result.confirmed) return;

    await approveMutation.mutateAsync(provider.id);
    showToast("Đã duyệt nhà cung cấp.", "success");
  }

  async function rejectProvider() {
    if (!provider) return;

    const result = await confirm({
      title: "Từ chối nhà cung cấp",
      description: `Hồ sơ "${provider.businessName}" sẽ bị từ chối và lý do này sẽ được lưu cho quản trị viên theo dõi.`,
      confirmLabel: "Từ chối",
      cancelLabel: "Hủy",
      tone: "danger",
      input: {
        label: "Lý do từ chối",
        placeholder:
          "Ví dụ: giấy phép kinh doanh chưa rõ, thông tin thuế không khớp...",
        required: true,
      },
    });
    if (!result.confirmed || !result.value) return;

    await rejectMutation.mutateAsync({
      providerId: provider.id,
      payload: { reason: result.value },
    });
    showToast("Đã từ chối hồ sơ nhà cung cấp.", "success");
  }

  async function suspendProvider() {
    if (!provider) return;

    const result = await confirm({
      title: "Tạm ngưng nhà cung cấp",
      description: getSuspendPromptMessage(provider),
      confirmLabel: "Tạm ngưng",
      cancelLabel: "Hủy",
      tone: "danger",
      input: {
        label: "Lý do tạm ngưng",
        placeholder: "Nhập lý do nếu cần...",
      },
    });
    if (!result.confirmed) return;

    await suspendMutation.mutateAsync({
      providerId: provider.id,
      payload: { reason: result.value || undefined },
    });
    showToast("Đã tạm ngưng nhà cung cấp.", "success");
  }

  return {
    providerQuery,
    provider,
    approveProvider,
    rejectProvider,
    suspendProvider,
  };
}
