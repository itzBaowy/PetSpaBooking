"use client";

import { useState } from "react";
import { CustomSelect } from "@/components/ui/custom-select";
import { useToast } from "@/components/ui/feedback-provider";
import { balanceAdjustmentSchema } from "../schema";
import { useAdjustProviderBalance, useProviderBalances } from "../queries";

export function BalanceAdjustmentForm({
  defaultProviderId,
}: {
  defaultProviderId?: string;
}) {
  const { data: providers } = useProviderBalances();
  const adjustmentMutation = useAdjustProviderBalance();
  const { showToast } = useToast();
  const [providerId, setProviderId] = useState(
    defaultProviderId ?? providers[0]?.providerId ?? "",
  );
  const [direction, setDirection] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [amount, setAmount] = useState("300000");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const result = balanceAdjustmentSchema.safeParse({
      providerId,
      direction,
      amount: Number(amount),
      ledgerType: "ADMIN_ADJUSTMENT",
      reason,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Điều chỉnh không hợp lệ.");
      return;
    }

    setError("");
    adjustmentMutation.mutate(result.data, {
      onError: () => {
        showToast("Không thể điều chỉnh số dư. Backend chưa hỗ trợ API này.", "error");
      },
      onSuccess: () => {
        showToast("Đã điều chỉnh số dư.", "success");
      },
    });
  };

  return (
    <section className="rounded-xl border border-border-subtle bg-surface p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Điều chỉnh số dư thủ công
        </h2>
        <p className="mt-1 text-sm text-muted">
          Tạo bút toán ADMIN_ADJUSTMENT kèm lý do kiểm toán. Danh tính quản trị
          viên được xác định từ access token.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-muted">Nhà cung cấp</span>
          <CustomSelect
            defaultValue={providerId}
            options={providers.map((provider) => ({
              label: provider.providerName,
              value: provider.providerId,
            }))}
            onValueChange={setProviderId}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-muted">Hướng điều chỉnh</span>
          <CustomSelect
            defaultValue={direction}
            options={[
              { label: "Cộng vào số dư khả dụng", value: "CREDIT" },
              { label: "Trừ khỏi số dư khả dụng", value: "DEBIT" },
            ]}
            onValueChange={(value) => setDirection(value as "CREDIT" | "DEBIT")}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-muted">Số tiền</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-11 w-full rounded-xl border border-border-subtle bg-surface px-4 text-sm font-semibold text-foreground shadow-sm outline-none focus:ring-4 focus:ring-brand-soft"
            inputMode="numeric"
          />
        </label>
        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-semibold text-muted">Lý do</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-24 w-full resize-y rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm outline-none focus:ring-4 focus:ring-brand-soft"
            placeholder="Nhập lý do cần điều chỉnh thủ công..."
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-danger">{error}</p>}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-5 text-sm font-bold text-background shadow-sm transition-colors hover:bg-muted"
        >
          Lưu điều chỉnh
        </button>
      </div>
    </section>
  );
}
