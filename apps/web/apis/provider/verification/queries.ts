import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const providerVerificationKeys = {
  all: ["providerVerification"] as const,
  me: () => [...providerVerificationKeys.all, "me"] as const,
  documents: () => [...providerVerificationKeys.all, "documents"] as const,
};

export function useMyProviderInfo(enabled = true) {
  return useQuery<ProviderInfo>({
    queryKey: providerVerificationKeys.me(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<ProviderInfo>>("/providers/me");
      return providerInfoSchema.parse(response.data.data);
    },
    enabled,
    retry: false,
  });
}

export function useMyProviderDocuments(enabled = true) {
  return useQuery<ProviderDocument[]>({
    queryKey: providerVerificationKeys.documents(),
    queryFn: async () => {
      const response =
        await api.get<ApiResponse<ProviderDocument[]>>(
          "/providers/me/documents",
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
      const response = await api.post<ApiResponse<ProviderInfo>>(
        "/providers/register",
        parsedPayload,
      );
      return providerInfoSchema.parse(response.data.data);
    },
    onSuccess: (provider) => {
      queryClient.setQueryData(providerVerificationKeys.me(), provider);
    },
  });
}

export function useUploadProviderDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UploadProviderDocumentData) => {
      const parsedPayload = uploadProviderDocumentSchema.parse(payload);
      const response = await api.post<ApiResponse<ProviderDocument>>(
        "/providers/me/documents",
        parsedPayload,
      );
      return providerDocumentSchema.parse(response.data.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerVerificationKeys.documents(),
      });
    },
  });
}
