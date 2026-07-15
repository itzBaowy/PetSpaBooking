"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { nested, textValue } from "@/apis/admin/supported-api";
import { useDailyRevenue, useDisputeReport, useProviderPerformance, useRevenueSummary } from "@/apis/admin/reports/queries";
import { PlatformRevenueChart } from "@/apis/admin/analytics/components/platform-revenue-chart";
import { TopProvidersTable } from "@/apis/admin/analytics/components/top-providers-table";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { formatCurrency } from "@/lib/currency";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { PageTitle, LoadState } from "../shared";

export function AdminDashboardPage() {
  const query = useQuery<Record<string, unknown>>({
    queryKey: ["admin-real", "dashboard"],
    queryFn: async () => (await api.get<ApiResponse<Record<string, unknown>>>(API_ENDPOINTS.ADMIN.DASHBOARD)).data.data,
  });
  const revenueQuery = useRevenueSummary();
  const dailyRevenueQuery = useDailyRevenue();
  const providersQuery = useProviderPerformance();
  const disputeReportQuery = useDisputeReport();

  const isLoading = query.isLoading || revenueQuery.isLoading || dailyRevenueQuery.isLoading || providersQuery.isLoading || disputeReportQuery.isLoading;
  const failedQuery = [query, revenueQuery, dailyRevenueQuery, providersQuery, disputeReportQuery].find((item) => item.isError);
  if (isLoading) return <div className="grid min-h-[55vh] place-items-center"><div className="text-center"><span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-brand-soft border-t-brand" /><p className="mt-3 text-sm font-semibold text-muted">Đang tải tổng quan quản trị...</p></div></div>;
  if (failedQuery?.isError) {
    return (
      <LoadState
        error={failedQuery.error}
        retry={() => void Promise.all([query.refetch(), revenueQuery.refetch(), dailyRevenueQuery.refetch(), providersQuery.refetch(), disputeReportQuery.refetch()])}
      />
    );
  }

  const data = query.data ?? {};
  const actionCards = [
    {
      label: "Tranh chấp chờ xử lý",
      value: nested(data, "disputes", "pending"),
      href: "/admin/bookings/disputes?status=PENDING",
      tone: "amber" as const,
    },
    {
      label: "Rút tiền chờ duyệt",
      value: nested(data, "withdrawals", "pending"),
      href: "/admin/finance/withdrawals?status=PENDING",
    },
    {
      label: "Nhà cung cấp chờ duyệt",
      value: nested(data, "providers", "pending"),
      href: "/admin/providers?status=PENDING_VERIFICATION",
      tone: "blue" as const,
    },
  ];
  const quickMetrics = [
    { label: "Người dùng", value: nested(data, "users", "total") },
    { label: "Nhà cung cấp", value: nested(data, "providers", "total") },
    { label: "Lịch đặt hoàn tất", value: nested(data, "bookings", "completed") },
    { label: "Dịch vụ hoạt động", value: nested(data, "services", "active") },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Tổng quan quản trị" description="Gọn gàng, tập trung vào hành động nhanh và trạng thái hiện tại." />

      <StatisticCardGrid columns={3}>
        {actionCards.map((card) => {
          const content = (
            <StatisticCard
              title={card.label}
              value={textValue(card.value, "0")}
              tone={card.tone}
              footer="Bấm để xem danh sách xử lý"
              className="h-full hover:border-brand-soft hover:bg-surface-muted/40"
            />
          );

          return (
            <Link key={card.label} href={card.href} className="block h-full">
              {content}
            </Link>
          );
        })}
      </StatisticCardGrid>

      <StatisticCardGrid columns={4}>
        {quickMetrics.map((card) => (
          <StatisticCard key={card.label} title={card.label} value={textValue(card.value, "0")} />
        ))}
      </StatisticCardGrid>

      {revenueQuery.data && (
        <StatisticCardGrid columns={3}>
          <StatisticCard title="Tổng giá trị booking" value={formatCurrency(revenueQuery.data.totalBookingAmount, "VND")} tone="blue" />
          <StatisticCard title="Hoa hồng nền tảng" value={formatCurrency(revenueQuery.data.totalCommission, "VND")} tone="green" />
          <StatisticCard title="Thu nhập nhà cung cấp" value={formatCurrency(revenueQuery.data.totalProviderEarning, "VND")} tone="purple" />
        </StatisticCardGrid>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <section className="min-w-0 xl:col-span-8">
          {dailyRevenueQuery.data && <PlatformRevenueChart data={dailyRevenueQuery.data} />}
        </section>

        {disputeReportQuery.data && (
          <section className="min-w-0 xl:col-span-4">
            <div className="mb-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand">Cần theo dõi</p>
              <h2 className="mt-1 text-lg font-black text-foreground">Trạng thái vận hành</h2>
            </div>
            <StatisticCardGrid columns={2}>
              <StatisticCard title="Tranh chấp chờ xử lý" value={disputeReportQuery.data.pending} tone="amber" />
              <StatisticCard title="Nhà cung cấp thắng" value={disputeReportQuery.data.resolvedProviderWin} tone="green" />
              <StatisticCard title="Khách hàng thắng" value={disputeReportQuery.data.resolvedCustomerWin} tone="blue" />
              <StatisticCard title="Đã hủy khiếu nại" value={disputeReportQuery.data.cancelled} tone="red" />
            </StatisticCardGrid>
          </section>
        )}
      </div>

      {providersQuery.data && (
        <section className="min-w-0 space-y-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand">Hiệu suất nổi bật</p>
            <h2 className="mt-1 text-lg font-black text-foreground">Nhà cung cấp hàng đầu</h2>
          </div>
          <TopProvidersTable providers={providersQuery.data.items} />
        </section>
      )}
    </div>
  );
}
