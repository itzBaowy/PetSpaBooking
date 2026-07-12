"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { Button, CustomSelect, Input, Textarea, useToast } from "@/components/ui";
import { entitySchema } from "@/apis/admin/supported-api";
import {
  LoadState,
  useAdminDetail,
  displayValue,
  EntityFields,
  EntityTable,
  StatusPill,
  errorMessage,
} from "../shared";

export function AdminProviderWalletPage({ id }: { id: string }) {
  const client = useQueryClient();
  const query = useAdminDetail("wallet", id ? API_ENDPOINTS.ADMIN.PROVIDER_WALLET(id) : null);
  const { showToast } = useToast();
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [balanceType, setBalanceType] = useState("WALLET");
  const [amountText, setAmountText] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationFn: async (payload: { balanceType: string; amount: number; reason: string }) =>
      (await api.post<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.ADJUST_PROVIDER_WALLET(id), payload)).data.data,
    onSuccess: () => void client.invalidateQueries({ queryKey: ["admin-real"] }),
  });

  if (query.isLoading) return <p>Đang tải...</p>;
  if (query.isError || !query.data) {
    return (
      <LoadState
        error={query.error ?? new Error("Không tìm thấy ví nhà cung cấp.")}
        retry={() => void query.refetch()}
      />
    );
  }

  const resetAdjustDialog = () => {
    setBalanceType("WALLET");
    setAmountText("");
    setReason("");
    setFormError("");
  };

  const closeAdjustDialog = () => {
    setIsAdjustDialogOpen(false);
    resetAdjustDialog();
  };

  const submitAdjust = () => {
    const amount = Number(amountText);
    if (!Number.isFinite(amount) || amount === 0) {
      setFormError("Số tiền điều chỉnh không hợp lệ.");
      return;
    }
    if (!reason.trim()) {
      setFormError("Vui lòng nhập lý do điều chỉnh.");
      return;
    }

    setFormError("");
    mutation.mutate(
      { balanceType, amount, reason: reason.trim() },
      {
        onSuccess: () => {
          closeAdjustDialog();
          showToast("Điều chỉnh số dư thành công.", "success");
        },
        onError: (error) => showToast(errorMessage(error), "error"),
      },
    );
  };

  const w = query.data;
  const recentTransactions = Array.isArray(w.recentTransactions)
    ? w.recentTransactions.flatMap((item: unknown) => {
        const parsed = entitySchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/providers/${id}`} className="text-sm font-semibold text-brand transition-colors hover:text-brand-hover">
          &larr; Quay lại hồ sơ nhà cung cấp
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-brand-soft/20 blur-2xl" />
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Ví nhà cung cấp</h2>
            <p className="text-sm text-muted">ID: {id}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Số dư ví</p>
            <p className="mt-1 text-xl font-extrabold text-emerald-700">{displayValue(w.walletBalance, "walletBalance")}</p>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Số dư ký quỹ</p>
            <p className="mt-1 text-xl font-extrabold text-indigo-700">{displayValue(w.depositBalance, "depositBalance")}</p>
          </div>
          <div className="col-span-2 rounded-xl border border-border-subtle bg-surface-soft p-4 text-center sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Trạng thái ký quỹ</p>
            <div className="mt-2 flex justify-center"><StatusPill value={w.depositStatus} /></div>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h3 className="font-bold text-foreground">Chi tiết ví</h3>
          </div>
          <Button
            onClick={() => setIsAdjustDialogOpen(true)}
            className="rounded-xl bg-gray-900 font-bold text-white shadow-sm transition-all hover:bg-gray-800"
          >
            Điều chỉnh số dư
          </Button>
        </div>
        <EntityFields entity={w} omit={["recentTransactions", "transactionTotals"]} />
      </div>

      {recentTransactions.length > 0 && (
        <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="font-bold text-foreground">Giao dịch gần đây ({recentTransactions.length})</h3>
          </div>
          <EntityTable loading={false} items={recentTransactions} columns={["type", "balanceType", "amount", "balanceAfter", "createAt"]} />
        </section>
      )}

      {isAdjustDialogOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-3xl border border-border-muted bg-surface p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-foreground">Điều chỉnh số dư</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Nhập số âm để trừ khỏi số dư.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Loại số dư</span>
                <CustomSelect
                  className="mt-2"
                  value={balanceType}
                  options={[
                    { value: "WALLET", label: "Ví" },
                    { value: "DEPOSIT", label: "Ký quỹ" },
                  ]}
                  onValueChange={setBalanceType}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-foreground">Số tiền</span>
                <Input
                  className="mt-2"
                  type="number"
                  inputMode="decimal"
                  value={amountText}
                  placeholder="Ví dụ: 100000 hoặc -50000"
                  onChange={(event) => setAmountText(event.target.value)}
                  autoFocus
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-foreground">Lý do</span>
                <Textarea
                  className="mt-2 min-h-24"
                  value={reason}
                  placeholder="Nhập lý do..."
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>

              {formError && <p className="text-sm font-semibold text-danger">{formError}</p>}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={closeAdjustDialog}>
                Hủy
              </Button>
              <Button onClick={submitAdjust} disabled={mutation.isLoading}>
                {mutation.isLoading ? "Đang lưu..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
