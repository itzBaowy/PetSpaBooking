import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiEnvelope } from "@/types/provider-api";
import type { ProviderInfo } from "@/apis/provider/verification/schema";

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const businessProfileKeys = {
  all: ["provider", "business-profile"] as const,
  detail: () => [...businessProfileKeys.all, "detail"] as const,
};

export function useProviderBusinessProfile() {
  return useQuery({
    queryKey: businessProfileKeys.detail(),
    queryFn: async () => unwrap<ProviderInfo>(await api.get(API_ENDPOINTS.PROVIDERS.ME)),
  });
}

export function useUpdateProviderBusinessProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Partial<
        Pick<
          ProviderInfo,
          "businessName" | "description" | "avatarUrl" | "coverImageUrl" | "phone" | "email" | "address" | "lat" | "lng"
        >
      >,
    ) => unwrap<ProviderInfo>(await api.put(API_ENDPOINTS.PROVIDERS.ME, payload)),
    onSuccess: (data) => {
      queryClient.setQueryData(businessProfileKeys.detail(), data);
    },
  });
}
