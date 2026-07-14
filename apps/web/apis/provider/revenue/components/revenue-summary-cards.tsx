"use client";

import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";

export function RevenueSummaryCards() {
  return (
    <StatisticCardGrid columns={4}>
      <StatisticCard title="Total Revenue" value="$0.00" tone="green" />
      <StatisticCard title="This Month" value="$0.00" tone="blue" />
      <StatisticCard title="Đang chờ xử lý" value="$0.00" tone="amber" />
      <StatisticCard title="Completed Bookings" value={0} />
    </StatisticCardGrid>
  );
}
