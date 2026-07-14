"use client";

import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { useCommissionSummary } from "../queries";
import { formatCurrency } from "./commission-format";

export function CommissionSummaryCards() {
  const { data: summary } = useCommissionSummary();

  return (
    <StatisticCardGrid columns={4}>
      <StatisticCard
        title="Tiền khách đang giữ"
        value={formatCurrency(summary.heldAmount)}
        tone="amber"
        valueClassName="text-2xl"
        footer="Gross online payment đang nằm trên sàn, chưa settle/refund."
      />
      <StatisticCard
        title="Hoa hồng chờ thu"
        value={formatCurrency(summary.pendingCommissionAmount)}
        tone="blue"
        valueClassName="text-2xl"
        footer="Commission dự kiến từ booking chưa hoàn tất."
      />
      <StatisticCard
        title="Hoa hồng đã thu"
        value={formatCurrency(summary.chargedCommissionAmount)}
        tone="green"
        valueClassName="text-2xl"
        footer={`Cash ${formatCurrency(summary.cashCommissionAmount)} / Online ${formatCurrency(summary.onlineCommissionAmount)}`}
      />
      <StatisticCard
        title="Hoàn / hủy / lỗi"
        value={formatCurrency(
          summary.refundedCommissionAmount +
            summary.cancelledCommissionAmount +
            summary.failedCommissionAmount,
        )}
        tone="red"
        valueClassName="text-2xl"
        footer={`Đã hoàn ${formatCurrency(summary.refundedCommissionAmount)} / Chờ hoàn ${formatCurrency(summary.refundPendingAmount)} / Hủy ${formatCurrency(summary.cancelledCommissionAmount)} / Lỗi ${formatCurrency(summary.failedCommissionAmount)}`}
      />
    </StatisticCardGrid>
  );
}
