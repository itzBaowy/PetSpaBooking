"use client";

import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { useCommissionSummary } from "../queries";
import { formatCurrency } from "./commission-format";

export function CommissionSummaryCards() {
  const { data: summary } = useCommissionSummary();

  return (
    <StatisticCardGrid columns={4}>
      <StatisticCard
        title="Đang giữ"
        value={formatCurrency(summary.reservedAmount)}
        tone="amber"
        valueClassName="text-2xl"
      />
      <StatisticCard
        title="Đã thu"
        value={formatCurrency(summary.chargedAmount)}
        tone="green"
        valueClassName="text-2xl"
      />
      <StatisticCard
        title="Đã hoàn"
        value={formatCurrency(summary.releasedAmount)}
        tone="blue"
        valueClassName="text-2xl"
      />
      <StatisticCard
        title="Thất bại"
        value={formatCurrency(summary.failedAmount)}
        tone="red"
        valueClassName="text-2xl"
      />
    </StatisticCardGrid>
  );
}
