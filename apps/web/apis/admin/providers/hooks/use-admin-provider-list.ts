"use client";

import { useState } from "react";
import { useConfirmDialog, useToast } from "@/components/ui/feedback-provider";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useAdminProviders,
  useApproveProvider,
  useRejectProvider,
  useSuspendProvider,
} from "../queries";
import type { AdminProvider, AdminProviderStatus } from "../schema";
import {
  getApproveConfirmMessage,
  getSuspendPromptMessage,
} from "../provider-helpers";
import { errorMessage } from "@/components/admin/shared";

export function useAdminProviderList(defaultStatus?: AdminProviderStatus) {
  const confirm = useConfirmDialog();
  const { showToast } = useToast();
  const approveMutation = useApproveProvider();
  const rejectMutation = useRejectProvider();
  const suspendMutation = useSuspendProvider();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [providerStatus, setProviderStatus] = useState<
    "" | AdminProviderStatus
  >(defaultStatus ?? "");
  const debouncedSearch = useDebounce(search, 350);

  const providersQuery = useAdminProviders({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    providerStatus: providerStatus || undefined,
  });

  const records = providersQuery.data?.items ?? [];
  const total = providersQuery.data?.totalItem ?? 0;
  const totalPages = Math.max(providersQuery.data?.totalPage ?? 1, 1);

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeStatus(value: "" | AdminProviderStatus) {
    setProviderStatus(value);
    setPage(1);
  }

  function changePageSize(value: number) {
    setPageSize(value);
    setPage(1);
  }

  async function approveProvider(provider: AdminProvider) {
    const result = await confirm({
      title: "Duyệt nhà cung cấp",
      description: getApproveConfirmMessage(provider),
      confirmLabel: "Duyệt hồ sơ",
      cancelLabel: "Hủy",
      tone: "success",
    });
    if (!result.confirmed) return;

    try {
      await approveMutation.mutateAsync(provider.id);
      showToast("Đã duyệt nhà cung cấp.", "success");
    } catch (error) {
      showToast(errorMessage(error), "error");
    }
  }

  async function rejectProvider(provider: AdminProvider) {
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

    try {
      await rejectMutation.mutateAsync({
        providerId: provider.id,
        payload: { reason: result.value },
      });
      showToast("Đã từ chối hồ sơ nhà cung cấp.", "success");
    } catch (error) {
      showToast(errorMessage(error), "error");
    }
  }

  async function suspendProvider(provider: AdminProvider) {
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

    try {
      await suspendMutation.mutateAsync({
        providerId: provider.id,
        payload: { reason: result.value || undefined },
      });
      showToast("Đã tạm ngưng nhà cung cấp.", "success");
    } catch (error) {
      showToast(errorMessage(error), "error");
    }
  }

  return {
    providersQuery,
    records,
    total,
    totalPages,
    page,
    pageSize,
    search,
    providerStatus,
    setPage,
    changePageSize,
    changeSearch,
    changeStatus,
    approveProvider,
    rejectProvider,
    suspendProvider,
  };
}
