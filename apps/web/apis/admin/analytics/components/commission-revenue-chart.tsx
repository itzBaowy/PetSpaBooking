"use client";

import { useCommissionRevenueTrend } from "../queries";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(value);
}

export function CommissionRevenueChart() {
  const { data: points } = useCommissionRevenueTrend();
  const maxValue = Math.max(
    ...points.map((point) => point.cashCommission + point.onlineCommission),
  );

  return (
    <section className="rounded-xl border border-border-subtle bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Doanh thu hoa hồng
          </h3>
          <p className="text-sm text-muted">
            Hoa hồng tiền mặt và online theo từng tháng.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            Tiền mặt
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            Online
          </span>
        </div>
      </div>
      <div className="mt-6 flex h-64 items-end gap-4 overflow-x-auto pb-2">
        {points.map((point) => {
          const cashHeight = Math.max(
            8,
            Math.round((point.cashCommission / maxValue) * 220),
          );
          const onlineHeight = Math.max(
            8,
            Math.round((point.onlineCommission / maxValue) * 220),
          );

          return (
            <div key={point.month} className="flex min-w-16 flex-1 flex-col items-center gap-2">
              <div className="flex h-56 items-end gap-1.5">
                <div
                  className="w-5 rounded-t-lg bg-brand"
                  style={{ height: cashHeight }}
                  title={formatCurrency(point.cashCommission)}
                />
                <div
                  className="w-5 rounded-t-lg bg-success"
                  style={{ height: onlineHeight }}
                  title={formatCurrency(point.onlineCommission)}
                />
              </div>
              <p className="text-xs font-bold text-muted">{point.month}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
