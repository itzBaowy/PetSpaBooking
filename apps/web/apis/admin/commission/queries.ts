"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
  Commission,
  CommissionConfig,
  CommissionDisplayStatus,
  CommissionStatus,
} from "@/types/commission";
import { listSchema } from "@/apis/admin/supported-api";
import { commissionConfigSchema } from "./schema";
import type { CommissionConfigData } from "./schema";

export interface CommissionSummary {
  heldAmount: number;
  pendingHeldAmount: number;
  pendingCommissionAmount: number;
  refundPendingAmount: number;
  refundPendingCommissionAmount: number;
  reservedAmount: number;
  chargedAmount: number;
  chargedCommissionAmount: number;
  releasedAmount: number;
  releasedCommissionAmount: number;
  refundedCommissionAmount: number;
  releasedWithoutRefundCommissionAmount: number;
  cancelledCommissionAmount: number;
  failedAmount: number;
  failedCommissionAmount: number;
  cashCommissionAmount: number;
  onlineCommissionAmount: number;
}

export interface CommissionListParams {
  page?: number;
  pageSize?: number;
  status?: CommissionStatus;
  paymentMethod?: "CASH" | "ONLINE";
  providerId?: string;
  bookingId?: string;
  from?: string;
  to?: string;
}

type DefinedQuery<T> = UseQueryResult<T, unknown> & { data: T };

function withDefault<T>(query: UseQueryResult<T, unknown>, fallback: T): DefinedQuery<T> {
  return { ...query, data: query.data ?? fallback } as DefinedQuery<T>;
}

const emptySummary: CommissionSummary = {
  heldAmount: 0,
  pendingHeldAmount: 0,
  pendingCommissionAmount: 0,
  refundPendingAmount: 0,
  refundPendingCommissionAmount: 0,
  reservedAmount: 0,
  chargedAmount: 0,
  chargedCommissionAmount: 0,
  releasedAmount: 0,
  releasedCommissionAmount: 0,
  refundedCommissionAmount: 0,
  releasedWithoutRefundCommissionAmount: 0,
  cancelledCommissionAmount: 0,
  failedAmount: 0,
  failedCommissionAmount: 0,
  cashCommissionAmount: 0,
  onlineCommissionAmount: 0,
};

function normalizeCommission(item: Record<string, unknown>): Commission {
  return {
    id: String(item.id ?? ""),
    bookingId: String(item.bookingId ?? ""),
    providerId: String(item.providerId ?? ""),
    providerName: String(item.providerName ?? "Unknown provider"),
    serviceName: String(item.serviceName ?? "Unknown service"),
    bookingAmount: Number(item.bookingAmount ?? 0),
    heldAmount: Number(item.heldAmount ?? 0),
    commissionAmount: Number(item.commissionAmount ?? 0),
    providerEarning: Number(item.providerEarning ?? 0),
    rateLabel: String(item.rateLabel ?? ""),
    status: String(item.status ?? "PENDING") as CommissionStatus,
    displayStatus: String(
      item.displayStatus ?? item.status ?? "PENDING",
    ) as CommissionDisplayStatus,
    fundSource: String(item.fundSource ?? "NONE"),
    fundStatus: String(item.fundStatus ?? "NOT_HELD"),
    paymentMethod: String(item.paymentMethod ?? "CASH") as Commission["paymentMethod"],
    reservedAt: item.reservedAt ? String(item.reservedAt) : undefined,
    chargedAt: item.chargedAt ? String(item.chargedAt) : undefined,
    releasedAt: item.releasedAt ? String(item.releasedAt) : undefined,
    failedAt: item.failedAt ? String(item.failedAt) : undefined,
    collectedFrom: item.collectedFrom ? String(item.collectedFrom) : null,
    failureReason: item.failureReason ? String(item.failureReason) : null,
    releaseReason: item.releaseReason ? String(item.releaseReason) : null,
  };
}

function normalizeSummary(data: Partial<CommissionSummary> | null | undefined): CommissionSummary {
  return {
    heldAmount: Number(data?.heldAmount ?? data?.reservedAmount ?? 0),
    pendingHeldAmount: Number(data?.pendingHeldAmount ?? data?.heldAmount ?? data?.reservedAmount ?? 0),
    pendingCommissionAmount: Number(data?.pendingCommissionAmount ?? 0),
    refundPendingAmount: Number(data?.refundPendingAmount ?? 0),
    refundPendingCommissionAmount: Number(data?.refundPendingCommissionAmount ?? 0),
    reservedAmount: Number(data?.reservedAmount ?? 0),
    chargedAmount: Number(data?.chargedAmount ?? 0),
    chargedCommissionAmount: Number(data?.chargedCommissionAmount ?? data?.chargedAmount ?? 0),
    releasedAmount: Number(data?.releasedAmount ?? 0),
    releasedCommissionAmount: Number(data?.releasedCommissionAmount ?? data?.releasedAmount ?? 0),
    refundedCommissionAmount: Number(data?.refundedCommissionAmount ?? data?.releasedCommissionAmount ?? data?.releasedAmount ?? 0),
    releasedWithoutRefundCommissionAmount: Number(data?.releasedWithoutRefundCommissionAmount ?? 0),
    cancelledCommissionAmount: Number(data?.cancelledCommissionAmount ?? data?.releasedWithoutRefundCommissionAmount ?? 0),
    failedAmount: Number(data?.failedAmount ?? 0),
    failedCommissionAmount: Number(data?.failedCommissionAmount ?? data?.failedAmount ?? 0),
    cashCommissionAmount: Number(data?.cashCommissionAmount ?? 0),
    onlineCommissionAmount: Number(data?.onlineCommissionAmount ?? 0),
  };
}

function commissionParams(params?: CommissionListParams) {
  return {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 100,
    status: params?.status,
    paymentMethod: params?.paymentMethod,
    providerId: params?.providerId,
    bookingId: params?.bookingId,
    from: params?.from,
    to: params?.to,
  };
}

export function useCommissionSummary() {
  const query = useQuery<CommissionSummary>({
    queryKey: queryKeys.adminCommission.summary(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<CommissionSummary>>(
        API_ENDPOINTS.ADMIN.COMMISSION.SUMMARY,
      );
      return normalizeSummary(response.data.data);
    },
  });
  return withDefault(query, emptySummary);
}

export function useCommissionRecords(params?: CommissionListParams) {
  const normalizedParams = commissionParams(params);
  const query = useQuery<Commission[]>({
    queryKey: [...queryKeys.adminCommission.records(), normalizedParams] as const,
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(
        API_ENDPOINTS.ADMIN.COMMISSION.RECORDS,
        { params: normalizedParams },
      );
      return listSchema
        .parse(response.data.data)
        .items.map((item) => normalizeCommission(item as Record<string, unknown>));
    },
  });
  return withDefault(query, []);
}

export function usePendingCommissions(params?: Omit<CommissionListParams, "status">) {
  const normalizedParams = commissionParams({ ...params, status: "PENDING" });
  const query = useQuery<Commission[]>({
    queryKey: [...queryKeys.adminCommission.pending(), normalizedParams] as const,
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(
        API_ENDPOINTS.ADMIN.COMMISSION.PENDING,
        { params: normalizedParams },
      );
      return listSchema
        .parse(response.data.data)
        .items.map((item) => normalizeCommission(item as Record<string, unknown>));
    },
  });
  return withDefault(query, []);
}

export function useCommissionDetail(id?: string) {
  return useQuery<Commission>({
    queryKey: [...queryKeys.adminCommission.all, "detail", id] as const,
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Record<string, unknown>>>(
        API_ENDPOINTS.ADMIN.COMMISSION.DETAIL(id!),
      );
      return normalizeCommission(response.data.data);
    },
  });
}

export function useCommissionConfigs() {
  const query = useQuery<CommissionConfig[]>({
    queryKey: queryKeys.adminCommission.configs(),
    queryFn: async (): Promise<CommissionConfig[]> => {
      throw new Error("Backend has no dedicated commission config list API. Use Admin settings platformCommissionRate instead.");
    },
    retry: false,
  });
  return withDefault(query, []);
}

export function useSaveCommissionConfig() {
  return useMutation({
    mutationFn: async (payload: CommissionConfigData) => {
      commissionConfigSchema.parse(payload);
      throw new Error("Backend has no dedicated commission config mutation API. Use Admin settings platformCommissionRate instead.");
    },
  });
}
