import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import {
  dailyRevenuePointSchema,
  disputeReportSchema,
  providerPerformanceListSchema,
  revenueSummarySchema,
} from "./schema";

export interface ReportDateRange {
  from?: string;
  to?: string;
}

export interface ProviderPerformanceParams extends ReportDateRange {
  page?: number;
  pageSize?: number;
}

export const reportKeys = {
  all: ["admin", "reports"] as const,
  revenue: (range: ReportDateRange) => [...reportKeys.all, "revenue", range] as const,
  dailyRevenue: (range: ReportDateRange) => [...reportKeys.all, "daily-revenue", range] as const,
  providers: (params: ProviderPerformanceParams) => [...reportKeys.all, "providers", params] as const,
  disputes: (range: ReportDateRange) => [...reportKeys.all, "disputes", range] as const,
};

export function useRevenueSummary(range: ReportDateRange = {}) {
  return useQuery({
    queryKey: reportKeys.revenue(range),
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.REPORTS.REVENUE, { params: range });
      return revenueSummarySchema.parse(response.data.data);
    },
  });
}

export function useDailyRevenue(range: ReportDateRange = {}) {
  return useQuery({
    queryKey: reportKeys.dailyRevenue(range),
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.REPORTS.DAILY_REVENUE, { params: range });
      return dailyRevenuePointSchema.array().parse(response.data.data);
    },
  });
}

export function useProviderPerformance(params: ProviderPerformanceParams = {}) {
  return useQuery({
    queryKey: reportKeys.providers(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.REPORTS.PROVIDERS, {
        params: { page: 1, pageSize: 5, ...params },
      });
      return providerPerformanceListSchema.parse(response.data.data);
    },
    keepPreviousData: true,
  });
}

export function useDisputeReport(range: ReportDateRange = {}) {
  return useQuery({
    queryKey: reportKeys.disputes(range),
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.REPORTS.DISPUTES, { params: range });
      return disputeReportSchema.parse(response.data.data);
    },
  });
}
