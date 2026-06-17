import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import type { ProviderBalanceRow } from "../queries";
import { formatCurrency } from "./finance-format";
import { LedgerTransactionTable } from "./ledger-transaction-table";
import { TrustScoreDetail } from "./trust-score-detail";

export function ProviderLedgerDetail({
  provider,
}: {
  provider: ProviderBalanceRow;
}) {
  return (
    <div className="space-y-6">
      <StatisticCardGrid columns={4}>
        <StatisticCard
          title="Số dư khả dụng"
          value={formatCurrency(provider.balance.availableBalance)}
          tone="green"
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Hoa hồng đã giữ"
          value={formatCurrency(provider.balance.reservedBalance)}
          tone="amber"
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Công nợ"
          value={formatCurrency(provider.balance.debtBalance)}
          tone={provider.balance.debtBalance > 0 ? "red" : "slate"}
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Vùng đệm an toàn"
          value={formatCurrency(provider.balance.safetyBuffer)}
          tone="blue"
          valueClassName="text-2xl"
        />
      </StatisticCardGrid>
      <TrustScoreDetail trustScore={provider.trustScore} />
      <LedgerTransactionTable providerId={provider.providerId} />
    </div>
  );
}
