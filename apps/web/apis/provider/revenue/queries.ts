import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const revenueKeys = {
  all: ["revenue"] as const,
  summary: () => [...revenueKeys.all, "summary"] as const,
  analytics: () => [...revenueKeys.all, "analytics"] as const,
};

export function useRevenueSummary() {
  return useQuery({
    queryKey: revenueKeys.summary(),
    queryFn: () => api.get("/revenue/summary"),
  });
}

export function useRevenueAnalytics() {
  return useQuery({
    queryKey: revenueKeys.analytics(),
    queryFn: () => api.get("/revenue/analytics"),
  });
}
