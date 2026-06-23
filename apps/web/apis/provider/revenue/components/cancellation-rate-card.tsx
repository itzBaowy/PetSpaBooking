"use client";

import { StatisticCard } from "@/components/ui/statistic-card";

export function CancellationRateCard() {
  return (
    <StatisticCard
      title="Cancellation Rate"
      value="0%"
      tone="red"
      footer="Last 30 days"
    />
  );
}
