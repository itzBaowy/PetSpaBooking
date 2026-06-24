"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/axios";

export interface WithdrawalRequest {
  id: string; providerName: string; amount: number; availableBalance: number;
  bankName: string; bankAccount: string; requestedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
}

export const withdrawalMockItems: WithdrawalRequest[] = [
  { id: "WD-24018", providerName: "Happy Paws Spa", amount: 8500000, availableBalance: 12400000, bankName: "Vietcombank", bankAccount: "**** 4821", requestedAt: "21/06/2026 09:20", status: "PENDING" },
  { id: "WD-24012", providerName: "VetCare 24h", amount: 5200000, availableBalance: 9100000, bankName: "MB Bank", bankAccount: "**** 1706", requestedAt: "20/06/2026 14:05", status: "APPROVED" },
  { id: "WD-23998", providerName: "Pet Hotel Luna", amount: 3000000, availableBalance: 6800000, bankName: "Techcombank", bankAccount: "**** 8830", requestedAt: "19/06/2026 10:30", status: "PAID" },
];
import type { LedgerTransaction } from "@/types/ledger";
import type { ProviderBalance, ProviderTrustScore } from "@/types/provider";
import { balanceAdjustmentSchema, debtActionSchema } from "./schema";
import type { BalanceAdjustmentData, DebtActionData } from "./schema";

export interface ProviderBalanceRow {
  providerId: string;
  providerName: string;
  ownerName: string;
  balance: ProviderBalance;
  trustScore: ProviderTrustScore;
  cashEligible: boolean;
}

export interface ProviderDebtRow {
  providerId: string;
  providerName: string;
  debtBalance: number;
  overdueDays: number;
  lastOffsetAt?: string;
  status: "WATCH" | "OVERDUE" | "ESCALATED";
}

export const providerBalanceMockItems: ProviderBalanceRow[] = [
  {
    providerId: "PRV-2001",
    providerName: "Happy Paws Spa",
    ownerName: "Anh Nguyen",
    cashEligible: true,
    balance: {
      availableBalance: 7200000,
      reservedBalance: 1260000,
      debtBalance: 0,
      safetyBuffer: 1500000,
      currency: "VND",
      lastUpdatedAt: "2026-06-14 09:30",
    },
    trustScore: {
      score: 92,
      riskLevel: "LOW",
      completionRate: 97,
      noShowRate: 1.2,
      disputeRate: 0.8,
      cashAbnormalityRate: 0.5,
      lastCalculatedAt: "2026-06-14",
    },
  },
  {
    providerId: "PRV-2002",
    providerName: "VetCare 24h",
    ownerName: "Huy Tran",
    cashEligible: true,
    balance: {
      availableBalance: 3100000,
      reservedBalance: 840000,
      debtBalance: 450000,
      safetyBuffer: 1200000,
      currency: "VND",
      lastUpdatedAt: "2026-06-14 08:10",
    },
    trustScore: {
      score: 81,
      riskLevel: "WATCH",
      completionRate: 91,
      noShowRate: 3.6,
      disputeRate: 2.4,
      cashAbnormalityRate: 1.8,
      lastCalculatedAt: "2026-06-14",
    },
  },
  {
    providerId: "PRV-2003",
    providerName: "Paws & Claws Spa",
    ownerName: "Mai Do",
    cashEligible: false,
    balance: {
      availableBalance: 520000,
      reservedBalance: 630000,
      debtBalance: 1850000,
      safetyBuffer: 1500000,
      currency: "VND",
      lastUpdatedAt: "2026-06-13 18:45",
    },
    trustScore: {
      score: 58,
      riskLevel: "RESTRICTED",
      completionRate: 76,
      noShowRate: 8.5,
      disputeRate: 7.2,
      cashAbnormalityRate: 5.1,
      lastCalculatedAt: "2026-06-14",
    },
  },
];

export const ledgerMockItems: LedgerTransaction[] = [
  {
    id: "LED-90018",
    providerId: "PRV-2001",
    providerName: "Happy Paws Spa",
    type: "RESERVE_COMMISSION",
    direction: "DEBIT",
    amount: 102000,
    balanceAfter: 7200000,
    createdAt: "2026-06-14 15:32",
    metadata: { bookingId: "BK-92018", note: "Cash booking confirmed" },
  },
  {
    id: "LED-90017",
    providerId: "PRV-2002",
    providerName: "VetCare 24h",
    type: "CHARGE_COMMISSION",
    direction: "DEBIT",
    amount: 63000,
    balanceAfter: 3100000,
    createdAt: "2026-06-14 11:50",
    metadata: { bookingId: "BK-92002", commissionId: "COM-7002" },
  },
  {
    id: "LED-90016",
    providerId: "PRV-2003",
    providerName: "Paws & Claws Spa",
    type: "ADMIN_ADJUSTMENT",
    direction: "CREDIT",
    amount: 300000,
    balanceAfter: 520000,
    createdAt: "2026-06-13 18:45",
    metadata: {
      admin_id: "ADM-001",
      reason: "Manual correction after duplicated debt offset.",
    },
  },
  {
    id: "LED-90015",
    providerId: "PRV-2003",
    providerName: "Paws & Claws Spa",
    type: "DEBT_OFFSET",
    direction: "CREDIT",
    amount: 500000,
    balanceAfter: 220000,
    createdAt: "2026-06-12 09:10",
    metadata: { note: "Online payout offset" },
  },
];

export const providerDebtMockItems: ProviderDebtRow[] = [
  {
    providerId: "PRV-2003",
    providerName: "Paws & Claws Spa",
    debtBalance: 1850000,
    overdueDays: 9,
    lastOffsetAt: "2026-06-12",
    status: "OVERDUE",
  },
  {
    providerId: "PRV-2002",
    providerName: "VetCare 24h",
    debtBalance: 450000,
    overdueDays: 2,
    status: "WATCH",
  },
];

export function useProviderBalances() {
  return useQuery<ProviderBalanceRow[]>({
    queryKey: queryKeys.adminFinance.balances(),
    queryFn: async () => {
      const response = await api.get<ProviderBalanceRow[]>(
        API_ENDPOINTS.ADMIN.FINANCE.BALANCES,
      );
      return response.data;
    },
    initialData: providerBalanceMockItems,
    enabled: false,
  });
}

export function useProviderBalanceDetail(providerId: string) {
  return useQuery<ProviderBalanceRow | undefined>({
    queryKey: queryKeys.adminFinance.providerBalance(providerId),
    queryFn: async () => {
      const response = await api.get<ProviderBalanceRow>(
        API_ENDPOINTS.ADMIN.FINANCE.PROVIDER_BALANCE(providerId),
      );
      return response.data;
    },
    initialData: providerBalanceMockItems.find(
      (provider) => provider.providerId === providerId,
    ),
    enabled: false,
  });
}

export function useLedgerTransactions() {
  return useQuery<LedgerTransaction[]>({
    queryKey: queryKeys.adminFinance.ledger(),
    queryFn: async () => {
      const response = await api.get<LedgerTransaction[]>(
        API_ENDPOINTS.ADMIN.FINANCE.LEDGER,
      );
      return response.data;
    },
    initialData: ledgerMockItems,
    enabled: false,
  });
}

export function useProviderDebts() {
  return useQuery<ProviderDebtRow[]>({
    queryKey: queryKeys.adminFinance.debts(),
    queryFn: async () => {
      const response = await api.get<ProviderDebtRow[]>(
        API_ENDPOINTS.ADMIN.FINANCE.DEBTS,
      );
      return response.data;
    },
    initialData: providerDebtMockItems,
    enabled: false,
  });
}

export function useAdjustProviderBalance() {
  return useMutation({
    mutationFn: async (payload: BalanceAdjustmentData) => {
      const parsedPayload = balanceAdjustmentSchema.parse(payload);
      const response = await api.post<{ success: boolean; ledgerId: string }>(
        API_ENDPOINTS.ADMIN.FINANCE.ADJUST_BALANCE,
        parsedPayload,
      );
      return response.data;
    },
  });
}

export function useResolveProviderDebt() {
  return useMutation({
    mutationFn: async (payload: DebtActionData) => {
      const parsedPayload = debtActionSchema.parse(payload);
      const response = await api.post<{ success: boolean }>(
        API_ENDPOINTS.ADMIN.FINANCE.DEBTS,
        parsedPayload,
      );
      return response.data;
    },
  });
}
