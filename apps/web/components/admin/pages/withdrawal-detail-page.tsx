"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { useConfirmDialog, useToast } from "@/components/ui";
import { entitySchema, textValue } from "@/apis/admin/supported-api";
import {
  LoadState,
  useAdminDetail,
  displayValue,
  DetailItem,
  EntityFields,
  StatusPill,
  errorMessage,
} from "../shared";

export function AdminWithdrawalDetailPage({ id }: { id: string }) {
  const client = useQueryClient();
  const query = useAdminDetail("withdrawal", id ? API_ENDPOINTS.ADMIN.WITHDRAWALS.DETAIL(id) : null);
  const confirm = useConfirmDialog();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ action, adminNote }: { action: string; adminNote?: string }) => {
      const url = action === "approve" ? API_ENDPOINTS.ADMIN.WITHDRAWALS.APPROVE(id)
        : action === "reject" ? API_ENDPOINTS.ADMIN.WITHDRAWALS.REJECT(id)
        : API_ENDPOINTS.ADMIN.WITHDRAWALS.MARK_PAID(id);
      return (await api.patch<ApiResponse<unknown>>(url, adminNote ? { adminNote } : {})).data.data;
    },
    onSuccess: () => void client.invalidateQueries({ queryKey: ["admin-real"] }),
  });

  if (query.isLoading) return <p>Đang tải...</p>;
  if (query.isError || !query.data) return <LoadState error={query.error ?? new Error("Không tìm thấy yêu cầu.")} retry={() => void query.refetch()} />;

  const act = async (action: string, required = false) => {
    const result = await confirm({
      title: action === "approve" ? "Duyệt yêu cầu rút tiền" : action === "reject" ? "Từ chối yêu cầu" : "Đánh dấu đã thanh toán",
      description: "Ghi chú admin:",
      input: { label: "Ghi chú", placeholder: "Nhập ghi chú...", required },
    });
    if (result.confirmed) {
      if (required && !result.value?.trim()) { showToast("Vui lòng nhập ghi chú.", "error"); return; }
      mutation.mutate(
        { action, ...(result.value ? { adminNote: result.value } : {}) },
        { onSuccess: () => showToast("Cập nhật yêu cầu rút tiền thành công.", "success"), onError: (e) => showToast(errorMessage(e), "error") }
      );
    }
  };

  const wd = query.data;
  const statusValue = textValue(wd.status);
  const providerObj = wd.provider && typeof wd.provider === "object" ? (wd.provider as Record<string, unknown>) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/finance/withdrawals" className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors">
          &larr; Quay lại danh sách rút tiền
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-brand-soft/20 blur-2xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Yêu cầu rút tiền</h2>
              <p className="text-sm text-muted">ID: {id}</p>
              <div className="mt-2 flex flex-wrap gap-2"><StatusPill value={wd.status} /></div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted">Số tiền yêu cầu</p>
            <p className="text-2xl font-extrabold text-foreground">{displayValue(wd.amount, "amount")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="font-bold text-foreground">Chi tiết yêu cầu</h3>
          </div>
          <EntityFields entity={wd} omit={["provider"]} />
        </div>

        {providerObj && (
          <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="font-bold text-foreground">Nhà cung cấp</h3>
            </div>
            <EntityFields entity={entitySchema.catch({ id: "" }).parse(providerObj)} />
          </div>
        )}
      </div>

      {(statusValue === "PENDING" || statusValue === "APPROVED") && (
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-foreground">Hành động xử lý</h3>
          <div className="flex flex-wrap gap-3">
            {statusValue === "PENDING" && (
              <>
                <Button onClick={() => act("approve")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm">Duyệt yêu cầu</Button>
                <Button onClick={() => act("reject", true)} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-sm">Từ chối</Button>
              </>
            )}
            {statusValue === "APPROVED" && (
              <Button onClick={() => act("paid")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm">Đánh dấu đã trả</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
