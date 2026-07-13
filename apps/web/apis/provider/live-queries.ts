import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiEnvelope, AvailabilityBlockApi, ProviderBookingApi, ProviderNotificationApi, ProviderPage, ProviderServiceApi, ProviderServicePage, ProviderWalletApi, WalletTransactionApi, WithdrawalApi, WorkingHourApi } from "@/types/provider-api";
import type { ProviderInfo } from "./verification/schema";

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;
export const providerLiveKeys = {
  services: ["provider-live", "services"] as const,
  bookings: (params?: object) => ["provider-live", "bookings", params] as const,
  workingHours: ["provider-live", "working-hours"] as const,
  blocks: ["provider-live", "availability-blocks"] as const,
  wallet: ["provider-live", "wallet"] as const,
  transactions: (params?: object) => ["provider-live", "transactions", params] as const,
  withdrawals: (params?: object) => ["provider-live", "withdrawals", params] as const,
  notifications: (params?: object) => ["provider-live", "notifications", params] as const,
  profile: ["provider-live", "profile"] as const,
};

export function useProviderServicesApi() {
  return useQuery({ queryKey: providerLiveKeys.services, queryFn: async () => {
    type RawServicePage = Omit<ProviderServicePage, "items"> & { items: Array<Omit<ProviderServiceApi, "category"> & { category?: string | null }> };
    const page = unwrap<RawServicePage>(await api.get(API_ENDPOINTS.SERVICES.MY, { params: { page: 1, pageSize: 100 } }));
    return { ...page, items: page.items.map((item) => ({ ...item, category: item.category ? { name: item.category } : null })) } satisfies ProviderServicePage;
  } });
}
export function useToggleProviderServiceApi() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async (id: string) => unwrap<ProviderServiceApi>(await api.patch(API_ENDPOINTS.SERVICES.TOGGLE(id))), onSuccess: () => client.invalidateQueries({ queryKey: providerLiveKeys.services }) });
}
export type ProviderServicePayload = { name: string; description?: string; price: number; duration: number; category: string; imageUrls?: string[] };
export function useSaveProviderServiceApi() { const client=useQueryClient(); return useMutation({ mutationFn: async ({id,payload}:{id?:string;payload:ProviderServicePayload}) => unwrap<ProviderServiceApi>(id ? await api.put(API_ENDPOINTS.SERVICES.UPDATE(id),payload) : await api.post(API_ENDPOINTS.SERVICES.CREATE,payload)), onSuccess:()=>client.invalidateQueries({queryKey:providerLiveKeys.services}) }); }
export function useProviderBookingsApi(params: Record<string, string | number | undefined>) {
  return useQuery({ queryKey: providerLiveKeys.bookings(params), queryFn: async () => unwrap<ProviderPage<ProviderBookingApi>>(await api.get(API_ENDPOINTS.MOBILE.PROVIDER.BOOKINGS, { params })) });
}
export function useProviderBookingActionApi() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async ({ id, action, reason, qrToken }: { id: string; action: "confirm" | "reject" | "cancel" | "no-arrival" | "check-in" | "check-out"; reason?: string; qrToken?: string }) => {
    const endpoint = action === "confirm" ? API_ENDPOINTS.MOBILE.PROVIDER.CONFIRM_BOOKING(id) : action === "reject" ? API_ENDPOINTS.MOBILE.PROVIDER.REJECT_BOOKING(id) : action === "cancel" ? API_ENDPOINTS.MOBILE.PROVIDER.CANCEL_BOOKING(id) : action === "no-arrival" ? API_ENDPOINTS.MOBILE.PROVIDER.NO_ARRIVAL(id) : action === "check-in" ? API_ENDPOINTS.MOBILE.PROVIDER.CHECK_IN(id) : API_ENDPOINTS.MOBILE.PROVIDER.CHECK_OUT(id);
    const body = action === "check-in" || action === "check-out" ? { qrToken } : { reason };
    const response = action === "check-in" || action === "check-out" ? await api.post<ApiEnvelope<ProviderBookingApi>>(endpoint, body) : await api.patch<ApiEnvelope<ProviderBookingApi>>(endpoint, body);
    return unwrap(response);
  }, onSuccess: () => client.invalidateQueries({ queryKey: ["provider-live", "bookings"] }) });
}
export function useProviderAvailabilityApi() {
  const hours = useQuery({ queryKey: providerLiveKeys.workingHours, queryFn: async () => unwrap<WorkingHourApi[]>(await api.get(API_ENDPOINTS.MOBILE.PROVIDER.WORKING_HOURS)) });
  const blocks = useQuery({ queryKey: providerLiveKeys.blocks, queryFn: async () => unwrap<AvailabilityBlockApi[]>(await api.get(API_ENDPOINTS.MOBILE.PROVIDER.AVAILABILITY_BLOCKS)) });
  return { hours, blocks };
}
export function useSaveWorkingHoursApi() { const client = useQueryClient(); return useMutation({ mutationFn: async (items: WorkingHourApi[]) => unwrap<WorkingHourApi[]>(await api.put(API_ENDPOINTS.MOBILE.PROVIDER.WORKING_HOURS, { items })), onSuccess: () => client.invalidateQueries({ queryKey: providerLiveKeys.workingHours }) }); }
export function useProviderWalletApi() { return useQuery({ queryKey: providerLiveKeys.wallet, queryFn: async () => unwrap<ProviderWalletApi>(await api.get(API_ENDPOINTS.MOBILE.PROVIDER.WALLET)) }); }
export function useProviderTransactionsApi(params: Record<string, string | number | undefined>) { return useQuery({ queryKey: providerLiveKeys.transactions(params), queryFn: async () => unwrap<ProviderPage<WalletTransactionApi>>(await api.get(API_ENDPOINTS.MOBILE.PROVIDER.WALLET_TRANSACTIONS, { params })) }); }
export function useProviderWithdrawalsApi(params: Record<string, string | number | undefined>) { return useQuery({ queryKey: providerLiveKeys.withdrawals(params), queryFn: async () => unwrap<ProviderPage<WithdrawalApi>>(await api.get(API_ENDPOINTS.MOBILE.PROVIDER.WITHDRAWALS, { params })) }); }
export function useCreateWithdrawalApi() { const client = useQueryClient(); return useMutation({ mutationFn: async (payload: { amount: number; reason?: string }) => unwrap<WithdrawalApi>(await api.post(API_ENDPOINTS.MOBILE.PROVIDER.WITHDRAWALS, payload)), onSuccess: () => { client.invalidateQueries({ queryKey: ["provider-live", "withdrawals"] }); client.invalidateQueries({ queryKey: providerLiveKeys.wallet }); } }); }
export function useProviderNotificationsApi(params: Record<string, string | number | boolean | undefined>) { return useQuery({ queryKey: providerLiveKeys.notifications(params), queryFn: async () => unwrap<ProviderPage<ProviderNotificationApi>>(await api.get(API_ENDPOINTS.MOBILE.NOTIFICATIONS.LIST, { params })) }); }
export function useNotificationActionsApi() { const client = useQueryClient(); return useMutation({ mutationFn: async (id: string | "all") => { const endpoint = id === "all" ? API_ENDPOINTS.MOBILE.NOTIFICATIONS.MARK_ALL_READ : API_ENDPOINTS.MOBILE.NOTIFICATIONS.MARK_READ(id); return api.patch(endpoint); }, onSuccess: () => client.invalidateQueries({ queryKey: ["provider-live", "notifications"] }) }); }
export function useProviderProfileApi() { return useQuery({ queryKey: providerLiveKeys.profile, queryFn: async () => unwrap<ProviderInfo>(await api.get(API_ENDPOINTS.PROVIDERS.ME)) }); }
export function useUpdateProviderProfileApi() { const client=useQueryClient(); return useMutation({ mutationFn: async (payload: Partial<Pick<ProviderInfo,"businessName"|"description"|"avatarUrl"|"coverImageUrl"|"phone"|"email"|"address"|"lat"|"lng">>) => unwrap<ProviderInfo>(await api.put(API_ENDPOINTS.PROVIDERS.ME,payload)), onSuccess: data=>client.setQueryData(providerLiveKeys.profile,data) }); }
