import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import {
  providerDocumentSchema,
  providerInfoSchema,
  providerRegistrationSchema,
  uploadProviderDocumentSchema,
} from "./schema";
import type {
  ProviderDocument,
  ProviderInfo,
  ProviderRegistrationData,
  UploadProviderDocumentData,
} from "./schema";

export function useMyProviderInfo(enabled = true) {
  return useQuery<ProviderInfo>({
    queryKey: queryKeys.providerVerification.me(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<ProviderInfo>>(
        API_ENDPOINTS.PROVIDERS.ME,
      );
      return providerInfoSchema.parse(response.data.data);
    },
    enabled,
    retry: false,
  });
}

export function useMyProviderDocuments(enabled = true) {
  return useQuery<ProviderDocument[]>({
    queryKey: queryKeys.providerVerification.documents(),
    queryFn: async () => {
      const response =
        await api.get<ApiResponse<ProviderDocument[]>>(
          API_ENDPOINTS.PROVIDERS.MY_DOCUMENTS,
        );
      return zodArrayParse(response.data.data);
    },
    enabled,
    retry: false,
  });
}

function zodArrayParse(data: ProviderDocument[]) {
  return data.map((item) => providerDocumentSchema.parse(item));
}

export function useRegisterProviderApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProviderRegistrationData) => {
      const parsedPayload = providerRegistrationSchema.parse(payload);
      const response = await api.post<
        ApiResponse<{ tokens: { accessToken: string; refreshToken: string }; provider: ProviderInfo }>
      >(API_ENDPOINTS.PROVIDERS.REGISTER, parsedPayload);
      
      const { provider } = response.data.data;
      return {
        tokens: response.data.data.tokens,
        provider: providerInfoSchema.parse(provider),
      };
    },
    onSuccess: ({ provider }) => {
      queryClient.setQueryData(queryKeys.providerVerification.me(), provider);
    },
  });
}

export function useUploadProviderDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UploadProviderDocumentData) => {
      const parsedPayload = uploadProviderDocumentSchema.parse(payload);
      const response = await api.post<ApiResponse<ProviderDocument>>(
        API_ENDPOINTS.PROVIDERS.MY_DOCUMENTS,
        parsedPayload,
      );
      return providerDocumentSchema.parse(response.data.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.providerVerification.documents(),
      });
    },
  });
}
