"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import { useConfirmDialog, useToast } from "@/components/ui";
import type { ApiResponse } from "@/types/api";
import type { AdminEntity } from "@/apis/admin/supported-api";
import {
  EntityTable,
  LoadState,
  PageTitle,
  Pager,
  errorMessage,
  useAdminList,
} from "../shared";

export function AdminRefundsPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirmDialog();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useAdminList("refunds", API_ENDPOINTS.ADMIN.REFUNDS.LIST, {
    page,
    pageSize,
  });

  const mutation = useMutation({
    mutationFn: async ({
      bookingId,
      action,
      adminNote,
    }: {
      bookingId: string;
      action: "mark-refunded" | "reject";
      adminNote?: string;
    }) => {
      const url =
        action === "mark-refunded"
          ? API_ENDPOINTS.ADMIN.REFUNDS.MARK_REFUNDED(bookingId)
          : API_ENDPOINTS.ADMIN.REFUNDS.REJECT(bookingId);
      return (await api.patch<ApiResponse<unknown>>(url, adminNote ? { adminNote } : {})).data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-real"] });
    },
  });

  const act = async (item: AdminEntity, action: "mark-refunded" | "reject") => {
    const result = await confirm({
      title: action === "mark-refunded" ? "Đánh dấu đã hoàn tiền" : "Từ chối hoàn tiền",
      description:
        action === "mark-refunded"
          ? "Xác nhận admin đã hoàn tiền ngoài hệ thống/MoMo dashboard."
          : "Booking sẽ quay lại trạng thái thanh toán SUCCESS.",
      tone: action === "reject" ? "danger" : "success",
      input: {
        label: "Ghi chú admin",
        placeholder: "Nhập ghi chú xử lý...",
        required: action === "reject",
      },
      confirmLabel: action === "mark-refunded" ? "Đã hoàn tiền" : "Từ chối",
      cancelLabel: "Hủy",
    });
    if (!result.confirmed) return;
    if (action === "reject" && !result.value?.trim()) {
      showToast("Vui lòng nhập ghi chú khi từ chối hoàn tiền.", "error");
      return;
    }

    mutation.mutate(
      {
        bookingId: item.id,
        action,
        adminNote: result.value?.trim(),
      },
      {
        onSuccess: () =>
          showToast(
            action === "mark-refunded"
              ? "Đã đánh dấu hoàn tiền."
              : "Đã từ chối hoàn tiền.",
            "success",
          ),
        onError: (error) => showToast(errorMessage(error), "error"),
      },
    );
  };

  if (query.isError) {
    return <LoadState error={query.error} retry={() => void query.refetch()} />;
  }

  return (
    <div className="space-y-5">
      <PageTitle
        title="Yêu cầu hoàn tiền"
        description="Xử lý các booking online có paymentStatus = REFUND_PENDING."
      />
      <EntityTable
        loading={query.isLoading}
        items={query.data?.items}
        columns={[
          "id",
          "customer.users.fullName",
          "provider.businessName",
          "service.name",
          "totalAmount",
          "paymentStatus",
          "cancelledAt",
        ]}
        detailBase="/admin/finance/refunds"
        actions={(item) => [
          {
            label: "Đánh dấu đã hoàn tiền",
            onClick: () => void act(item, "mark-refunded"),
          },
          {
            label: "Từ chối hoàn tiền",
            onClick: () => void act(item, "reject"),
            variant: "danger",
          },
        ]}
      />
      <Pager data={query.data} setPage={setPage} setPageSize={setPageSize} />
    </div>
  );
}
