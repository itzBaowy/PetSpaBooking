"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
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

type DefinedQuery<T> = UseQueryResult<T, unknown> & { data: T };

function withDefault<T>(query: UseQueryResult<T, unknown>, fallback: T): DefinedQuery<T> {
  return { ...query, data: query.data ?? fallback } as DefinedQuery<T>;
}

function unsupported(): never {
  throw new Error("Backend has no commission management API yet.");
}

const emptySummary: CommissionSummary = {
  reservedAmount: 0,
  chargedAmount: 0,
  releasedAmount: 0,
  failedAmount: 0,
  cashCommissionAmount: 0,
  onlineCommissionAmount: 0,
};

export function useCommissionSummary() {
  const query = useQuery<CommissionSummary>({
    queryKey: ["admin", "commission", "summary"],
    queryFn: async (): Promise<CommissionSummary> => unsupported(),
    retry: false,
  });
  return withDefault(query, emptySummary);
}

export function useCommissionRecords() {
  const query = useQuery<Commission[]>({
    queryKey: ["admin", "commission", "records"],
    queryFn: async (): Promise<Commission[]> => unsupported(),
    retry: false,
  });
  return withDefault(query, []);
}

export function usePendingCommissions() {
  const query = useQuery<Commission[]>({
    queryKey: ["admin", "commission", "pending"],
    queryFn: async (): Promise<Commission[]> => unsupported(),
    retry: false,
  });
  return withDefault(query, []);
}

export function useCommissionConfigs() {
  const query = useQuery<CommissionConfig[]>({
    queryKey: ["admin", "commission", "configs"],
    queryFn: async (): Promise<CommissionConfig[]> => unsupported(),
    retry: false,
  });
  return withDefault(query, []);
}

export function useSaveCommissionConfig() {
  return useMutation({
    mutationFn: async (payload: CommissionConfigData) => {
      commissionConfigSchema.parse(payload);
      unsupported();
    },
  });
}
