import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type {
  ApiEnvelope,
  ProviderPage,
  ProviderDepositPaymentApi,
  ProviderWalletApi,
  WalletTransactionApi,
  WithdrawalApi,
} from "@/types/provider-api";

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const walletKeys = {
  all: ["provider", "wallet"] as const,
  summary: () => [...walletKeys.all, "summary"] as const,
  transactions: (params?: object) => [...walletKeys.all, "transactions", params] as const,
  withdrawals: (params?: object) => [...walletKeys.all, "withdrawals", params] as const,
};

export function useProviderWallet() {
  return useQuery({
    queryKey: walletKeys.summary(),
    queryFn: async () =>
      unwrap<ProviderWalletApi>(await api.get(API_ENDPOINTS.MOBILE.PROVIDER.WALLET)),
  });
}

export function useProviderWalletTransactions(params: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: walletKeys.transactions(params),
    queryFn: async () =>
      unwrap<ProviderPage<WalletTransactionApi>>(
        await api.get(API_ENDPOINTS.MOBILE.PROVIDER.WALLET_TRANSACTIONS, { params }),
      ),
  });
}

export function useProviderWithdrawals(params: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: walletKeys.withdrawals(params),
    queryFn: async () =>
      unwrap<ProviderPage<WithdrawalApi>>(
        await api.get(API_ENDPOINTS.MOBILE.PROVIDER.WITHDRAWALS, { params }),
      ),
  });
}

export function useCreateProviderWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { amount: number; reason?: string }) =>
      unwrap<WithdrawalApi>(await api.post(API_ENDPOINTS.MOBILE.PROVIDER.WITHDRAWALS, payload)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useCreateProviderDepositPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { amount: number }) =>
      unwrap<ProviderDepositPaymentApi>(
        await api.post(
          API_ENDPOINTS.MOBILE.PROVIDER.DEPOSIT_MOMO_CREATE_PAYMENT,
          payload,
        ),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}
