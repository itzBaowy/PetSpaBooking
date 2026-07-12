"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { useConfirmDialog, useToast } from "@/components/ui";
import { entitySchema } from "@/apis/admin/supported-api";
import {
  LoadState,
  useAdminDetail,
  displayValue,
  DetailItem,
  EntityFields,
  EntityTable,
  StatusPill,
  errorMessage,
} from "../shared";

export function AdminProviderWalletPage({ id }: { id: string }) {
  const client = useQueryClient();
  const query = useAdminDetail("wallet", id ? API_ENDPOINTS.ADMIN.PROVIDER_WALLET(id) : null);
  const confirm = useConfirmDialog();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: async (payload: { balanceType: string; amount: number; reason: string }) =>
      (await api.post<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.ADJUST_PROVIDER_WALLET(id), payload)).data.data,
    onSuccess: () => void client.invalidateQueries({ queryKey: ["admin-real"] }),
  });

  if (query.isLoading) return <p>Đang tải...</p>;
  if (query.isError || !query.data) return <LoadState error={query.error ?? new Error("Không tìm thấy ví nhà cung cấp.")} retry={() => void query.refetch()} />;

  const adjust = async () => {
    const choiceResult = await confirm({
      title: "Chọn loại số dư",
      description: "Nhập 'VÍ' hoặc 'KÝ QUỸ' để điều chỉnh:",
      input: { label: "Loại số dư", placeholder: "VÍ hoặc KÝ QUỸ", defaultValue: "VÍ", required: true },
    });
    if (!choiceResult.confirmed || !choiceResult.value) return;
    const choice = choiceResult.value.trim().toUpperCase();
    const balanceType = choice === "VÍ" ? "WALLET" : choice === "KÝ QUỸ" ? "DEPOSIT" : choice;
    if (!["WALLET", "DEPOSIT"].includes(balanceType)) { showToast("Loại số dư không hợp lệ.", "error"); return; }

    const amountResult = await confirm({
      title: `Điều chỉnh số dư ${choice}`,
      description: "Nhập số tiền điều chỉnh (khác 0; nhập số âm để trừ):",
      input: { label: "Số tiền", placeholder: "Ví dụ: 100000 hoặc -50000", required: true },
    });
    if (!amountResult.confirmed || !amountResult.value) return;
    const amount = Number(amountResult.value);
    if (!Number.isFinite(amount) || amount === 0) { showToast("Số tiền điều chỉnh không hợp lệ.", "error"); return; }

    const reasonResult = await confirm({
      title: "Lý do điều chỉnh",
      description: "Vui lòng nhập lý do thực hiện điều chỉnh này:",
      input: { label: "Lý do", placeholder: "Nhập lý do...", required: true },
    });
    if (!reasonResult.confirmed || !reasonResult.value) return;

    mutation.mutate(
      { balanceType, amount, reason: reasonResult.value.trim() },
      {
        onSuccess: () => showToast("Điều chỉnh số dư thành công.", "success"),
        onError: (e) => showToast(errorMessage(e), "error"),
      }
    );
  };

  const w = query.data;
  const recentTransactions = Array.isArray(w.recentTransactions)
    ? w.recentTransactions.flatMap((x: unknown) => { const parsed = entitySchema.safeParse(x); return parsed.success ? [parsed.data] : []; })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/providers/${id}`} className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors">
          &larr; Quay lại hồ sơ nhà cung cấp
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-brand-soft/20 blur-2xl" />
        <div className="flex items-center gap-4 mb-6">
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
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Số dư ví</p>
            <p className="mt-1 text-xl font-extrabold text-emerald-700">{displayValue(w.walletBalance, "walletBalance")}</p>
          </div>
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Số dư ký quỹ</p>
            <p className="mt-1 text-xl font-extrabold text-indigo-700">{displayValue(w.depositBalance, "depositBalance")}</p>
          </div>
          <div className="rounded-xl bg-surface-soft border border-border-subtle p-4 text-center col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Trạng thái ký quỹ</p>
            <div className="mt-2 flex justify-center"><StatusPill value={w.depositStatus} /></div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h3 className="font-bold text-foreground">Chi tiết ví</h3>
          </div>
          <Button onClick={adjust} className="bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-sm">
            Điều chỉnh số dư
          </Button>
        </div>
        <EntityFields entity={w} omit={["recentTransactions", "transactionTotals"]} />
      </div>

      {recentTransactions.length > 0 && (
        <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="font-bold text-foreground">Giao dịch gần đây ({recentTransactions.length})</h3>
          </div>
          <EntityTable loading={false} items={recentTransactions} columns={["type", "balanceType", "amount", "balanceAfter", "createAt"]} />
        </section>
      )}
    </div>
  );
}
