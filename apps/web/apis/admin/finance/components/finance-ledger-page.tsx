"use client";

import { PageHeader } from "@/components/ui/page-header";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { BalanceAdjustmentForm } from "./balance-adjustment-form";
import { DebtManagementTable } from "./debt-management-table";
import { formatCurrency } from "./finance-format";
import { LedgerTransactionTable } from "./ledger-transaction-table";
import { ProviderBalanceTable } from "./provider-balance-table";
import { useProviderBalances, useProviderDebts } from "../queries";

export function FinanceLedgerPage() {
  const { data: balances } = useProviderBalances();
  const { data: debts } = useProviderDebts();
  const totalAvailable = balances.reduce(
    (total, provider) => total + provider.balance.availableBalance,
    0,
  );
  const totalReserved = balances.reduce(
    (total, provider) => total + provider.balance.reservedBalance,
    0,
  );
  const totalDebt = debts.reduce((total, debt) => total + debt.debtBalance, 0);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Quản trị / Tài chính"
        title="Số dư & sổ cái nhà cung cấp"
        description="Theo dõi ký quỹ, hoa hồng giữ lại, bù trừ nợ và điều chỉnh số dư thủ công."
      />

      <StatisticCardGrid columns={3}>
        <StatisticCard
          title="Số dư khả dụng"
          value={formatCurrency(totalAvailable)}
          tone="green"
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Hoa hồng giữ lại"
          value={formatCurrency(totalReserved)}
          tone="amber"
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Nợ đang mở"
          value={formatCurrency(totalDebt)}
          tone="red"
          valueClassName="text-2xl"
        />
      </StatisticCardGrid>

      <ProviderBalanceTable />
      <LedgerTransactionTable />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.55fr)]">
        <DebtManagementTable />
        <BalanceAdjustmentForm />
      </div>
    </div>
  );
}
