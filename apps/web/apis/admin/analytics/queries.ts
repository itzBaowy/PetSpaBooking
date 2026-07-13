import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

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

type DefinedQuery<T> = UseQueryResult<T, unknown> & { data: T };

function withDefault<T>(query: UseQueryResult<T, unknown>, fallback: T): DefinedQuery<T> {
  return { ...query, data: query.data ?? fallback } as DefinedQuery<T>;
}

export function useAnalyticsMetrics() {
  return useQuery({
    queryKey: analyticsKeys.metrics(),
    queryFn: async () =>
      (await api.get<ApiResponse<Record<string, unknown>>>(API_ENDPOINTS.ADMIN.DASHBOARD)).data.data,
  });
}

export function useBookingTrends() {
  return useQuery({
    queryKey: analyticsKeys.trends(),
    queryFn: async () =>
      (await api.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.REPORTS.DAILY_REVENUE)).data.data,
  });
}

export function useCommissionRevenueTrend() {
  const query = useQuery<CommissionRevenuePoint[]>({
    queryKey: analyticsKeys.commissionRevenue(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>(
        API_ENDPOINTS.ADMIN.REPORTS.DAILY_REVENUE,
      );
      return response.data.data.map((item) => ({
        month: String(item.date ?? ""),
        cashCommission: Number(item.totalCommission ?? 0),
        onlineCommission: 0,
      }));
    },
  });
  return withDefault(query, []);
}

export function useProviderRiskOverview() {
  const query = useQuery<ProviderRiskOverview>({
    queryKey: analyticsKeys.providerRisk(),
    queryFn: async (): Promise<ProviderRiskOverview> => {
      throw new Error("Backend has no provider risk overview API yet.");
    },
    retry: false,
  });
  return withDefault(query, { low: 0, watch: 0, restricted: 0, suspended: 0 });
}
