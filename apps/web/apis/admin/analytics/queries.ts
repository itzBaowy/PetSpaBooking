import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const analyticsKeys = {
  all: ["admin", "analytics"] as const,
  metrics: () => [...analyticsKeys.all, "metrics"] as const,
  trends: () => [...analyticsKeys.all, "trends"] as const,
  commissionRevenue: () =>
    [...analyticsKeys.all, "commission-revenue"] as const,
  providerRisk: () => [...analyticsKeys.all, "provider-risk"] as const,
};

export interface CommissionRevenuePoint {
  month: string;
  cashCommission: number;
  onlineCommission: number;
}

export interface ProviderRiskOverview {
  low: number;
  watch: number;
  restricted: number;
  suspended: number;
}

export const commissionRevenueMockItems: CommissionRevenuePoint[] = [
  { month: "Jan", cashCommission: 2300000, onlineCommission: 1800000 },
  { month: "Feb", cashCommission: 2800000, onlineCommission: 2100000 },
  { month: "Mar", cashCommission: 3200000, onlineCommission: 2400000 },
  { month: "Apr", cashCommission: 4100000, onlineCommission: 2600000 },
  { month: "May", cashCommission: 4700000, onlineCommission: 3100000 },
  { month: "Jun", cashCommission: 5120000, onlineCommission: 3330000 },
];

export const providerRiskOverviewMock: ProviderRiskOverview = {
  low: 38,
  watch: 9,
  restricted: 3,
  suspended: 1,
};

export function useAnalyticsMetrics() {
  return useQuery({
    queryKey: analyticsKeys.metrics(),
    queryFn: () => api.get("/analytics/metrics"),
  });
}

export function useBookingTrends() {
  return useQuery({
    queryKey: analyticsKeys.trends(),
    queryFn: () => api.get("/analytics/trends"),
  });
}

export function useCommissionRevenueTrend() {
  return useQuery<CommissionRevenuePoint[]>({
    queryKey: analyticsKeys.commissionRevenue(),
    queryFn: async () => {
      const response = await api.get<CommissionRevenuePoint[]>(
        "/admin/analytics/commission-revenue",
      );
      return response.data;
    },
    initialData: commissionRevenueMockItems,
    enabled: false,
  });
}

export function useProviderRiskOverview() {
  return useQuery<ProviderRiskOverview>({
    queryKey: analyticsKeys.providerRisk(),
    queryFn: async () => {
      const response = await api.get<ProviderRiskOverview>(
        "/admin/analytics/provider-risk",
      );
      return response.data;
    },
    initialData: providerRiskOverviewMock,
    enabled: false,
  });
}
