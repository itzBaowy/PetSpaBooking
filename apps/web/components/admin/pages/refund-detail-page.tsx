"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useConfirmDialog, useToast } from "@/components/ui";
import type { ApiResponse } from "@/types/api";
import { EntityFields, LoadState, StatusPill, errorMessage, useAdminDetail } from "../shared";

export function AdminRefundDetailPage({ bookingId }: { bookingId: string }) {
  const queryClient = useQueryClient();
  const confirm = useConfirmDialog();
  const { showToast } = useToast();
  const query = useAdminDetail(
    "refund",
    bookingId ? API_ENDPOINTS.ADMIN.REFUNDS.DETAIL(bookingId) : null,
  );

  const mutation = useMutation({
    mutationFn: async ({
      action,
      adminNote,
    }: {
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

  if (query.isLoading) return <p>Đang tải yêu cầu hoàn tiền...</p>;
  if (query.isError || !query.data) {
    return (
      <LoadState
        error={query.error ?? new Error("Không tìm thấy yêu cầu hoàn tiền.")}
        retry={() => void query.refetch()}
      />
    );
  }

  const refund = query.data;
  const act = async (action: "mark-refunded" | "reject") => {
    const result = await confirm({
      title: action === "mark-refunded" ? "Đánh dấu đã hoàn tiền" : "Từ chối hoàn tiền",
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
      { action, adminNote: result.value?.trim() },
      {
        onSuccess: () => showToast("Cập nhật hoàn tiền thành công.", "success"),
        onError: (error) => showToast(errorMessage(error), "error"),
      },
    );
  };

  const customer =
    refund.customer && typeof refund.customer === "object"
      ? (refund.customer as Record<string, unknown>)
      : null;
  const provider =
    refund.provider && typeof refund.provider === "object"
      ? (refund.provider as Record<string, unknown>)
      : null;
  const service =
    refund.service && typeof refund.service === "object"
      ? (refund.service as Record<string, unknown>)
      : null;

  return (
    <div className="space-y-6">
      <Link href="/admin/finance/refunds" className="text-sm font-semibold text-brand transition-colors hover:text-brand-hover">
        &larr; Quay lại danh sách hoàn tiền
      </Link>

      <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">
              Booking #{bookingId}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-foreground">
              Yêu cầu hoàn tiền
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill value={refund.paymentMethod} />
              <StatusPill value={refund.paymentStatus} />
              <StatusPill value={refund.status} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void act("mark-refunded")}
              disabled={mutation.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Đã hoàn tiền
            </Button>
            <Button
              onClick={() => void act("reject")}
              disabled={mutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Từ chối
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-foreground">Thông tin booking</h2>
          <EntityFields entity={refund} omit={["customer", "provider", "service", "dispute", "paymentTransactions"]} />
        </section>
        <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-foreground">Liên quan</h2>
          <div className="space-y-4">
            {customer && <EntityFields entity={{ id: String(customer.id ?? ""), ...customer }} />}
            {provider && <EntityFields entity={{ id: String(provider.id ?? ""), ...provider }} />}
            {service && <EntityFields entity={{ id: String(service.id ?? ""), ...service }} />}
          </div>
        </section>
      </div>
    </div>
  );
}
