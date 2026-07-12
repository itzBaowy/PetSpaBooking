"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { nested, textValue } from "@/apis/admin/supported-api";
import { PageTitle, LoadState } from "../shared";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { formatCurrency } from "@/lib/currency";
import { useDailyRevenue, useProviderPerformance, useRevenueSummary } from "@/apis/admin/reports/queries";
import { PlatformRevenueChart } from "@/apis/admin/analytics/components/platform-revenue-chart";
import { TopProvidersTable } from "@/apis/admin/analytics/components/top-providers-table";

export function AdminDashboardPage() {
  const query = useQuery<Record<string, unknown>>({
    queryKey: ["admin-real", "dashboard"],
    queryFn: async () => (await api.get<ApiResponse<Record<string, unknown>>>(API_ENDPOINTS.ADMIN.DASHBOARD)).data.data,
  });
  const revenueQuery = useRevenueSummary();
  const dailyRevenueQuery = useDailyRevenue();
  const providersQuery = useProviderPerformance();

  const isLoading = query.isLoading || revenueQuery.isLoading || dailyRevenueQuery.isLoading || providersQuery.isLoading;
  const failedQuery = [query, revenueQuery, dailyRevenueQuery, providersQuery].find((item) => item.isError);
  if (isLoading) return <p>Đang tải tổng quan...</p>;
  if (failedQuery?.isError) return <LoadState error={failedQuery.error} retry={() => void Promise.all([query.refetch(), revenueQuery.refetch(), dailyRevenueQuery.refetch(), providersQuery.refetch()])} />;

  const data = query.data ?? {};
  const cards = [
    ["Người dùng", nested(data, "users", "total")],
    ["Nhà cung cấp", nested(data, "providers", "total")],
    ["Lịch đặt hoàn tất", nested(data, "bookings", "completed")],
    ["Tranh chấp chờ xử lý", nested(data, "disputes", "pending")],
    ["Rút tiền chờ duyệt", nested(data, "withdrawals", "pending")],
    ["Dịch vụ hoạt động", nested(data, "services", "active")],
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Tổng quan quản trị" description="Số liệu trực tiếp từ GET /admin/dashboard/summary." />
      <StatisticCardGrid columns={3}>
        {cards.map(([label, value]) => (
          <StatisticCard key={String(label)} title={textValue(label)} value={textValue(value, "0")} />
        ))}
      </StatisticCardGrid>
      {revenueQuery.data && (
        <StatisticCardGrid columns={3}>
          <StatisticCard title="Tổng giá trị booking" value={formatCurrency(revenueQuery.data.totalBookingAmount, "VND")} tone="blue" />
          <StatisticCard title="Hoa hồng nền tảng" value={formatCurrency(revenueQuery.data.totalCommission, "VND")} tone="green" />
          <StatisticCard title="Thu nhập nhà cung cấp" value={formatCurrency(revenueQuery.data.totalProviderEarning, "VND")} tone="purple" />
        </StatisticCardGrid>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        {dailyRevenueQuery.data && <PlatformRevenueChart data={dailyRevenueQuery.data} />}
        {providersQuery.data && <TopProvidersTable providers={providersQuery.data.items} />}
      </div>
    </div>
  );
}
