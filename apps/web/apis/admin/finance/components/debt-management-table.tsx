"use client";

import { ActionMenu } from "@/components/ui/action-menu";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import { debtActionSchema } from "../schema";
import { useProviderDebts, useResolveProviderDebt } from "../queries";
import type { ProviderDebtRow } from "../queries";
import { formatCurrency } from "./finance-format";
import { FinanceStatusPill } from "./status-pill";

const debtStatusLabels = {
  WATCH: "Cần theo dõi",
  OVERDUE: "Quá hạn",
  ESCALATED: "Đã chuyển xử lý",
};

function handleDebtAction(
  provider: ProviderDebtRow,
  action: "MARK_RESOLVED" | "FORCE_OFFSET" | "ESCALATE",
  mutate: ReturnType<typeof useResolveProviderDebt>["mutate"],
) {
  const reason = window.prompt("Nhập lý do xử lý công nợ:");
  if (!reason) return;

  const result = debtActionSchema.safeParse({
    providerId: provider.providerId,
    action,
    reason,
  });

  if (!result.success) {
    window.alert(result.error.issues[0]?.message ?? "Thao tác công nợ không hợp lệ.");
    return;
  }

  mutate(result.data, {
    onError: () => window.alert("Thao tác công nợ đã được kiểm tra (mock)."),
    onSuccess: () => window.alert("Đã lưu thao tác công nợ (mock)."),
  });
}

export function DebtManagementTable() {
  const { data: debts } = useProviderDebts();
  const debtMutation = useResolveProviderDebt();

  const columns: Array<DataTableColumn<ProviderDebtRow>> = [
    {
      key: "provider",
      header: "Nhà cung cấp",
      render: (debt) => (
        <div>
          <p className="font-bold text-foreground">{debt.providerName}</p>
          <p className="text-xs text-muted">{debt.providerId}</p>
        </div>
      ),
    },
    {
      key: "debt",
      header: "Công nợ",
      render: (debt) => (
        <span className="font-bold text-danger">
          {formatCurrency(debt.debtBalance)}
        </span>
      ),
    },
    {
      key: "overdue",
      header: "Quá hạn",
      render: (debt) => `${debt.overdueDays} ngày`,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (debt) => (
        <FinanceStatusPill
          tone={debt.status === "WATCH" ? "warning" : "danger"}
        >
          {debtStatusLabels[debt.status]}
        </FinanceStatusPill>
      ),
    },
    {
      key: "lastOffset",
      header: "Bù trừ gần nhất",
      render: (debt) => debt.lastOffsetAt ?? "Chưa bù trừ",
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      isAction: true,
      render: (debt) => (
        <ActionMenu
          items={[
            {
              label: "Đánh dấu đã xử lý",
              onClick: () =>
                handleDebtAction(debt, "MARK_RESOLVED", debtMutation.mutate),
            },
            {
              label: "Bù trừ bắt buộc",
              onClick: () =>
                handleDebtAction(debt, "FORCE_OFFSET", debtMutation.mutate),
            },
            {
              label: "Chuyển xử lý cao hơn",
              variant: "danger",
              onClick: () =>
                handleDebtAction(debt, "ESCALATE", debtMutation.mutate),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Quản lý công nợ</h2>
        <p className="mt-1 text-sm text-muted">
          Theo dõi công nợ quá hạn của nhà cung cấp và các thao tác bù trừ.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={debts}
        getRowKey={(debt) => debt.providerId}
        minWidthClassName="min-w-[920px]"
      />
    </section>
  );
}
