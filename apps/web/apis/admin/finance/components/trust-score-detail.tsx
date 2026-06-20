import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import type { ProviderTrustScore } from "@/types/provider";
import { formatPercent } from "./finance-format";
import { RiskPill } from "./status-pill";

export function TrustScoreDetail({
  trustScore,
}: {
  trustScore: ProviderTrustScore;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Điểm tin cậy</h2>
          <p className="text-sm text-muted">
            Tính lần gần nhất lúc {trustScore.lastCalculatedAt}
          </p>
        </div>
        <RiskPill level={trustScore.riskLevel} />
      </div>
      <StatisticCardGrid columns={4}>
        <StatisticCard title="Điểm" value={`${trustScore.score}/100`} tone="blue" />
        <StatisticCard
          title="Tỷ lệ hoàn tất"
          value={formatPercent(trustScore.completionRate)}
          tone="green"
        />
        <StatisticCard
          title="Tỷ lệ vắng mặt"
          value={formatPercent(trustScore.noShowRate)}
          tone={trustScore.noShowRate > 5 ? "red" : "amber"}
        />
        <StatisticCard
          title="Tỷ lệ tranh chấp"
          value={formatPercent(trustScore.disputeRate)}
          tone={trustScore.disputeRate > 5 ? "red" : "slate"}
        />
      </StatisticCardGrid>
    </section>
  );
}
