"use client";

import { useProviderRiskOverview } from "../queries";

const riskRows = [
  { key: "low", label: "Rủi ro thấp", className: "bg-success" },
  { key: "watch", label: "Theo dõi", className: "bg-warning" },
  { key: "restricted", label: "Bị hạn chế", className: "bg-danger" },
  { key: "suspended", label: "Bị tạm khóa", className: "bg-slate-500" },
] as const;

export function ProviderRiskOverviewCard() {
  const { data: risk } = useProviderRiskOverview();
  const total = risk.low + risk.watch + risk.restricted + risk.suspended;

  return (
    <section className="rounded-xl border border-border-subtle bg-surface p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-foreground">
          Tổng quan rủi ro nhà cung cấp
        </h3>
        <p className="text-sm text-muted">
          Phân bổ điểm tin cậy của nhà cung cấp đang hoạt động.
        </p>
      </div>
      <div className="mt-6 space-y-4">
        {riskRows.map((row) => {
          const value = risk[row.key];
          const width = total > 0 ? `${Math.round((value / total) * 100)}%` : "0%";

          return (
            <div key={row.key}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">{row.label}</span>
                <span className="font-bold text-muted">{value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-surface-muted">
                <div className={row.className} style={{ width, height: "100%" }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
