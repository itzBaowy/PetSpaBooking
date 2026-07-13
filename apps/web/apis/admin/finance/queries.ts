"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { listSchema } from "@/apis/admin/supported-api";
import type { LedgerTransaction } from "@/types/ledger";
import type { ProviderBalance, ProviderTrustScore } from "@/types/provider";
import { balanceAdjustmentSchema, debtActionSchema } from "./schema";
import type { BalanceAdjustmentData, DebtActionData } from "./schema";

export interface WithdrawalRequest {
  id: string;
  providerName?: string;
  amount: number;
  availableBalance?: number;
  bankName?: string;
  bankAccount?: string;
  requestedAt?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
}

export interface ProviderBalanceRow {
  providerId: string;
  providerName: string;
  ownerName?: string;
  balance: ProviderBalance;
  trustScore: ProviderTrustScore;
  cashEligible?: boolean;
}

export interface ProviderDebtRow {
  providerId: string;
  providerName: string;
  debtBalance: number;
  overdueDays: number;
  lastOffsetAt?: string;
  status: "WATCH" | "OVERDUE" | "ESCALATED";
}

type DefinedQuery<T> = UseQueryResult<T, unknown> & { data: T };

function withDefault<T>(query: UseQueryResult<T, unknown>, fallback: T): DefinedQuery<T> {
  return { ...query, data: query.data ?? fallback } as DefinedQuery<T>;
}

const defaultTrustScore: ProviderTrustScore = {
  score: 0,
  riskLevel: "LOW",
  completionRate: 0,
  noShowRate: 0,
  disputeRate: 0,
  cashAbnormalityRate: 0,
  lastCalculatedAt: "",
};

export function useProviderBalances() {
  const query = useQuery<ProviderBalanceRow[]>({
    queryKey: queryKeys.adminFinance.balances(),
    queryFn: async (): Promise<ProviderBalanceRow[]> => {
      throw new Error("Backend has no aggregate provider balance list API yet.");
    },
    retry: false,
  });
  return withDefault(query, []);
}

export function useProviderBalanceDetail(providerId: string) {
  const query = useQuery<ProviderBalanceRow>({
    queryKey: queryKeys.adminFinance.providerBalance(providerId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Record<string, unknown>>>(
        API_ENDPOINTS.ADMIN.PROVIDER_WALLET(providerId),
      );
      const data = response.data.data;
      return {
        providerId,
        providerName: String(data.businessName ?? data.providerName ?? providerId),
        balance: {
          availableBalance: Number(data.walletBalance ?? 0),
          reservedBalance: 0,
          debtBalance: 0,
          safetyBuffer: 0,
          currency: "VND",
          lastUpdatedAt: String(data.updateAt ?? data.createAt ?? ""),
        },
        trustScore: defaultTrustScore,
        cashEligible: String(data.depositStatus ?? "") === "ACTIVE",
      };
    },
    enabled: Boolean(providerId),
  });

  return withDefault(query, {
    providerId,
    providerName: providerId,
    balance: {
      availableBalance: 0,
      reservedBalance: 0,
      debtBalance: 0,
      safetyBuffer: 0,
      currency: "VND",
      lastUpdatedAt: "",
    },
    trustScore: defaultTrustScore,
    cashEligible: false,
  });
}

export function useLedgerTransactions() {
  const query = useQuery<LedgerTransaction[]>({
    queryKey: queryKeys.adminFinance.ledger(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(
        API_ENDPOINTS.ADMIN.WALLET_TRANSACTIONS,
      );
      return listSchema.parse(response.data.data).items as unknown as LedgerTransaction[];
    },
  });
  return withDefault(query, []);
}

export function useProviderDebts() {
  const query = useQuery<ProviderDebtRow[]>({
    queryKey: queryKeys.adminFinance.debts(),
    queryFn: async (): Promise<ProviderDebtRow[]> => {
      throw new Error("Backend has no provider debt management API yet.");
    },
    retry: false,
  });
  return withDefault(query, []);
}

export function useAdjustProviderBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BalanceAdjustmentData) => {
      const parsedPayload = balanceAdjustmentSchema.parse(payload);
      if (!parsedPayload.providerId) {
        throw new Error("providerId is required");
      }
      const response = await api.post<ApiResponse<unknown>>(
        API_ENDPOINTS.ADMIN.ADJUST_PROVIDER_WALLET(parsedPayload.providerId),
        {
          balanceType: "WALLET",
          amount:
            parsedPayload.direction === "DEBIT"
              ? -parsedPayload.amount
              : parsedPayload.amount,
          reason: parsedPayload.reason,
        },
      );
      return response.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminFinance.all,
      });
    },
  });
}

export function useResolveProviderDebt() {
  return useMutation({
    mutationFn: async (_payload: DebtActionData) => {
      debtActionSchema.parse(_payload);
      throw new Error("Backend has no provider debt resolution API yet.");
    },
  });
}
