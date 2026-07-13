"use client";

import { useMemo, useState } from "react";
import { useDailyRevenue, useDisputeReport, useProviderPerformance, useRevenueSummary } from "@/apis/admin/reports/queries";
import type { ProviderPerformance } from "@/apis/admin/reports/schema";
import { PlatformRevenueChart } from "@/apis/admin/analytics/components/platform-revenue-chart";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { formatCurrency } from "@/lib/currency";
import { PageTitle, LoadState, Pager, StatusPill, inputClass } from "../shared";

function compactRange(from: string, to: string) {
  return {
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };
}

export function AdminReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [providerPage, setProviderPage] = useState(1);
  const [providerPageSize, setProviderPageSize] = useState(10);
  const range = useMemo(() => compactRange(from, to), [from, to]);

  const revenueQuery = useRevenueSummary(range);
  const dailyRevenueQuery = useDailyRevenue(range);
  const providersQuery = useProviderPerformance({
    ...range,
    page: providerPage,
    pageSize: providerPageSize,
  });
  const disputeQuery = useDisputeReport(range);

  const failedQuery = [revenueQuery, dailyRevenueQuery, providersQuery, disputeQuery].find((query) => query.isError);
  const providerPagerData = providersQuery.data
    ? {
        ...providersQuery.data,
        items: providersQuery.data.items.map((provider) => ({ id: provider.providerId })),
      }
    : undefined;

  if (failedQuery?.isError) {
    return (
      <LoadState
        error={failedQuery.error}
        retry={() => void Promise.all([
          revenueQuery.refetch(),
          dailyRevenueQuery.refetch(),
          providersQuery.refetch(),
          disputeQuery.refetch(),
        ])}
      />
    );
  }

  const providerColumns: Array<DataTableColumn<ProviderPerformance>> = [
    {
      key: "businessName",
      header: "Nhà cung cấp",
      render: (provider) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{provider.businessName}</p>
          <p className="mt-1 break-all font-mono text-xs text-muted">{provider.providerId}</p>
        </div>
      ),
    },
    {
      key: "providerStatus",
      header: "Trạng thái",
      render: (provider) => <StatusPill value={provider.providerStatus} />,
    },
    {
      key: "completedBookings",
      header: "Hoàn tất",
      align: "right",
      render: (provider) => provider.completedBookings.toLocaleString("vi-VN"),
    },
    {
      key: "totalRevenue",
      header: "Doanh thu",
      align: "right",
      render: (provider) => formatCurrency(provider.totalRevenue, "VND"),
    },
    {
      key: "commission",
      header: "Hoa hồng",
      align: "right",
      render: (provider) => formatCurrency(provider.commission, "VND"),
    },
    {
      key: "walletBalance",
      header: "Ví",
      align: "right",
      render: (provider) => formatCurrency(provider.walletBalance, "VND"),
    },
    {
      key: "rating",
      header: "Đánh giá",
      align: "right",
      render: (provider) => `${provider.averageRating.toFixed(1)} (${provider.totalReviews})`,
    },
    {
      key: "disputes",
      header: "Tranh chấp",
      align: "right",
      render: (provider) => provider.disputes.toLocaleString("vi-VN"),
    },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Báo cáo hệ thống" description="Theo dõi doanh thu, hiệu suất và đối soát tài chính." />

      <div className="rounded-xl border border-border-subtle bg-surface p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="shrink-0 text-xs font-semibold text-muted">Từ:</span>
            <input
              title="Từ ngày"
              type="datetime-local"
              className={inputClass}
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setProviderPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="shrink-0 text-xs font-semibold text-muted">Đến:</span>
            <input
              title="Đến ngày"
              type="datetime-local"
              className={inputClass}
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setProviderPage(1);
              }}
            />
          </div>
          <span className="w-full text-sm font-medium text-muted sm:ml-auto sm:w-auto">
            {providersQuery.isFetching || revenueQuery.isFetching || disputeQuery.isFetching ? "Đang tải..." : `${providersQuery.data?.pagination.totalItems ?? 0} nhà cung cấp`}
          </span>
        </div>
      </div>

      {revenueQuery.data && (
        <StatisticCardGrid columns={4}>
          <StatisticCard title="Tổng giá trị booking" value={formatCurrency(revenueQuery.data.totalBookingAmount, "VND")} tone="blue" />
          <StatisticCard title="Hoa hồng nền tảng" value={formatCurrency(revenueQuery.data.totalCommission, "VND")} tone="green" />
          <StatisticCard title="Thu nhập NCC" value={formatCurrency(revenueQuery.data.totalProviderEarning, "VND")} tone="purple" />
          <StatisticCard title="Đã chi trả rút tiền" value={formatCurrency(revenueQuery.data.withdrawalPaidAmount, "VND")} tone="slate" />
        </StatisticCardGrid>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {dailyRevenueQuery.data ? <PlatformRevenueChart data={dailyRevenueQuery.data} /> : <p className="rounded-xl border border-border-subtle bg-surface p-6 text-sm font-semibold text-muted">Đang tải biểu đồ doanh thu...</p>}
        </div>
        {disputeQuery.data && (
          <StatisticCardGrid columns={2} className="content-start lg:col-span-4">
            <StatisticCard title="Tranh chấp chờ xử lý" value={disputeQuery.data.pending.toLocaleString("vi-VN")} tone="amber" />
            <StatisticCard title="Nhà cung cấp thắng" value={disputeQuery.data.resolvedProviderWin.toLocaleString("vi-VN")} tone="green" />
            <StatisticCard title="Khách hàng thắng" value={disputeQuery.data.resolvedCustomerWin.toLocaleString("vi-VN")} tone="blue" />
            <StatisticCard title="Đã hủy khiếu nại" value={disputeQuery.data.cancelled.toLocaleString("vi-VN")} tone="red" />
          </StatisticCardGrid>
        )}
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Hiệu suất nhà cung cấp</h2>
          <p className="text-sm text-muted">Dữ liệu phân trang từ GET /admin/reports/providers.</p>
        </div>
        <div className="w-full overflow-x-auto">
          <DataTable
            columns={providerColumns}
            data={providersQuery.data?.items ?? []}
            getRowKey={(provider) => provider.providerId}
            minWidthClassName="min-w-[1180px]"
            emptyState={<div className="p-8 text-center text-sm font-semibold text-muted">Chưa có dữ liệu hiệu suất trong kỳ này.</div>}
          />
        </div>
        <Pager data={providerPagerData} setPage={setProviderPage} setPageSize={setProviderPageSize} />
      </section>
    </div>
  );
}
