"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/axios";
import type { Commission, CommissionConfig } from "@/types/commission";
import { commissionConfigSchema } from "./schema";
import type { CommissionConfigData } from "./schema";

export interface CommissionSummary {
  reservedAmount: number;
  chargedAmount: number;
  releasedAmount: number;
  failedAmount: number;
  cashCommissionAmount: number;
  onlineCommissionAmount: number;
}

export const commissionSummaryMock: CommissionSummary = {
  reservedAmount: 1880000,
  chargedAmount: 8450000,
  releasedAmount: 620000,
  failedAmount: 210000,
  cashCommissionAmount: 5120000,
  onlineCommissionAmount: 3330000,
};

export const commissionMockItems: Commission[] = [
  {
    id: "COM-7001",
    bookingId: "BK-92018",
    providerId: "PRV-2001",
    providerName: "Happy Paws Spa",
    serviceName: "Premium Grooming",
    bookingAmount: 680000,
    commissionAmount: 102000,
    rateLabel: "15%",
    status: "PENDING",
    paymentMethod: "CASH",
    reservedAt: "2026-06-14 15:32",
  },
  {
    id: "COM-7002",
    bookingId: "BK-92002",
    providerId: "PRV-2002",
    providerName: "VetCare 24h",
    serviceName: "Vaccination",
    bookingAmount: 420000,
    commissionAmount: 63000,
    rateLabel: "15%",
    status: "CHARGED",
    paymentMethod: "CASH",
    reservedAt: "2026-06-14 11:02",
    chargedAt: "2026-06-14 11:50",
  },
  {
    id: "COM-6991",
    bookingId: "BK-91970",
    providerId: "PRV-2004",
    providerName: "Pet Hotel & Daycare",
    serviceName: "Overnight Stay",
    bookingAmount: 950000,
    commissionAmount: 142500,
    rateLabel: "15%",
    status: "RELEASED",
    paymentMethod: "MOMO",
    reservedAt: "2026-06-13 19:00",
  },
  {
    id: "COM-6986",
    bookingId: "BK-91942",
    providerId: "PRV-2003",
    providerName: "Paws & Claws Spa",
    serviceName: "Basic Bath",
    bookingAmount: 300000,
    commissionAmount: 45000,
    rateLabel: "15%",
    status: "FAILED",
    paymentMethod: "CASH",
    reservedAt: "2026-06-12 09:10",
  },
];

export const commissionConfigMockItems: CommissionConfig[] = [
  {
    id: "CFG-001",
    name: "Default platform commission",
    type: "PERCENTAGE",
    scope: "GLOBAL",
    scopeValue: "All services",
    value: 15,
    effectiveFrom: "2026-06-01",
    appliesToNewBookingsOnly: true,
    isActive: true,
  },
  {
    id: "CFG-002",
    name: "Clinic fixed safety fee",
    type: "FIXED",
    scope: "PROVIDER_TYPE",
    scopeValue: "CLINIC",
    value: 50000,
    effectiveFrom: "2026-06-10",
    appliesToNewBookingsOnly: true,
    isActive: true,
  },
  {
    id: "CFG-003",
    name: "Pet hotel campaign rate",
    type: "PERCENTAGE",
    scope: "SERVICE_CATEGORY",
    scopeValue: "PET_HOTEL",
    value: 12,
    effectiveFrom: "2026-06-15",
    appliesToNewBookingsOnly: true,
    isActive: false,
  },
];

export function useCommissionSummary() {
  return useQuery<CommissionSummary>({
    queryKey: queryKeys.adminCommission.summary(),
    queryFn: async () => {
      const response = await api.get<CommissionSummary>(
        API_ENDPOINTS.ADMIN.COMMISSION.SUMMARY,
      );
      return response.data;
    },
    initialData: commissionSummaryMock,
    enabled: false,
  });
}

export function useCommissionRecords() {
  return useQuery<Commission[]>({
    queryKey: queryKeys.adminCommission.records(),
    queryFn: async () => {
      const response = await api.get<Commission[]>(
        API_ENDPOINTS.ADMIN.COMMISSION.RECORDS,
      );
      return response.data;
    },
    initialData: commissionMockItems,
    enabled: false,
  });
}

export function usePendingCommissions() {
  return useQuery<Commission[]>({
    queryKey: queryKeys.adminCommission.pending(),
    queryFn: async () => {
      const response = await api.get<Commission[]>(
        API_ENDPOINTS.ADMIN.COMMISSION.PENDING,
      );
      return response.data;
    },
    initialData: commissionMockItems.filter(
      (commission) => commission.status === "PENDING",
    ),
    enabled: false,
  });
}

export function useCommissionConfigs() {
  return useQuery<CommissionConfig[]>({
    queryKey: queryKeys.adminCommission.configs(),
    queryFn: async () => {
      const response = await api.get<CommissionConfig[]>(
        API_ENDPOINTS.ADMIN.COMMISSION.CONFIGS,
      );
      return response.data;
    },
    initialData: commissionConfigMockItems,
    enabled: false,
  });
}

export function useSaveCommissionConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CommissionConfigData) => {
      const parsedPayload = commissionConfigSchema.parse(payload);
      const endpoint = parsedPayload.id
        ? API_ENDPOINTS.ADMIN.COMMISSION.UPDATE_CONFIG(parsedPayload.id)
        : API_ENDPOINTS.ADMIN.COMMISSION.CONFIGS;
      const response = await api.post<{ success: boolean; configId: string }>(
        endpoint,
        parsedPayload,
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminCommission.all,
      });
    },
  });
}
