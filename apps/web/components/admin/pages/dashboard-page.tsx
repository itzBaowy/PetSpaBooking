"use client";

import Link from "next/link";
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
  if (failedQuery?.isError) {
    return (
      <LoadState
        error={failedQuery.error}
        retry={() => void Promise.all([query.refetch(), revenueQuery.refetch(), dailyRevenueQuery.refetch(), providersQuery.refetch()])}
      />
    );
  }

  const data = query.data ?? {};
  const cards = [
    { label: "Người dùng", value: nested(data, "users", "total") },
    { label: "Nhà cung cấp", value: nested(data, "providers", "total") },
    { label: "Lịch đặt hoàn tất", value: nested(data, "bookings", "completed") },
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
    { label: "Dịch vụ hoạt động", value: nested(data, "services", "active") },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Tổng quan quản trị" description="Số liệu trực tiếp từ GET /admin/dashboard/summary." />
      <StatisticCardGrid columns={3}>
        {cards.map((card) => {
          const content = (
            <StatisticCard
              title={card.label}
              value={textValue(card.value, "0")}
              tone={card.tone}
              footer={card.href ? "Bấm để xem danh sách xử lý" : undefined}
              className={card.href ? "h-full hover:border-brand-soft hover:bg-surface-muted/40" : undefined}
            />
          );

          if (!card.href) return <div key={card.label}>{content}</div>;

          return (
            <Link key={card.label} href={card.href} className="block h-full">
              {content}
            </Link>
          );
        })}
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
