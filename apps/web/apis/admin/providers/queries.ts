import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse } from "@/types/api";
import {
  adminProviderDetailSchema,
  adminProviderListParamsSchema,
  adminProviderListSchema,
  adminProviderSchema,
  rejectProviderSchema,
  suspendProviderSchema,
} from "./schema";
import type {
  AdminProvider,
  AdminProviderDetail,
  AdminProviderList,
  AdminProviderListParams,
  RejectProviderData,
  SuspendProviderData,
} from "./schema";

function isForbiddenError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 403;
}

function handleForbiddenSession(error: unknown) {
  if (!isForbiddenError(error)) return false;

  useAuthStore.getState().clearTokens();
  return true;
}

function emptyProviderList(params: AdminProviderListParams): AdminProviderList {
  return {
    page: params.page,
    pageSize: params.pageSize,
    totalItem: 0,
    totalPage: 1,
    items: [],
  };
}

function buildProviderListParams(params: AdminProviderListParams) {
  const parsed = adminProviderListParamsSchema.parse(params);
  const queryParams: Record<string, string | number> = {
    page: parsed.page,
    pageSize: parsed.pageSize,
  };

  if (parsed.search?.trim()) {
    queryParams.filters = JSON.stringify({
      businessName: parsed.search.trim(),
    });
  }

  if (parsed.providerStatus) {
    queryParams.providerStatus = parsed.providerStatus;
  }

  return queryParams;
}

export function useAdminProviders(params: AdminProviderListParams) {
  const parsedParams = adminProviderListParamsSchema.parse(params);

  return useQuery<AdminProviderList>({
    queryKey: queryKeys.adminProviders.list(parsedParams),
    queryFn: async () => {
      try {
        const response = await api.get<ApiResponse<AdminProviderList>>(
          API_ENDPOINTS.PROVIDERS.LIST,
          { params: buildProviderListParams(parsedParams) },
        );
        return adminProviderListSchema.parse(response.data.data);
      } catch (error) {
        if (handleForbiddenSession(error)) {
          return emptyProviderList(parsedParams);
        }

        throw error;
      }
    },
    keepPreviousData: true,
  });
}

export function useAdminProvider(providerId: string) {
  return useQuery<AdminProviderDetail | null>({
    queryKey: queryKeys.adminProviders.detail(providerId),
    queryFn: async () => {
      try {
        const response = await api.get<ApiResponse<AdminProviderDetail>>(
          API_ENDPOINTS.PROVIDERS.DETAIL(providerId),
        );
        return adminProviderDetailSchema.parse(response.data.data);
      } catch (error) {
        if (handleForbiddenSession(error)) {
          return null;
        }

        throw error;
      }
    },
    enabled: Boolean(providerId),
  });
}

function useProviderMutation() {
  const queryClient = useQueryClient();

  function syncProvider(provider: AdminProvider) {
    queryClient.setQueryData<AdminProviderDetail | null>(
      queryKeys.adminProviders.detail(provider.id),
      (old) => {
        if (!old) return null;
        return {
          ...old,
          ...provider,
          documents:
            provider.providerStatus === "VERIFIED"
              ? old.documents.map((document) =>
                  document.status === "PENDING"
                    ? { ...document, status: "APPROVED", adminNote: null }
                    : document,
                )
              : old.documents,
        };
      },
    );
    void queryClient.invalidateQueries({ queryKey: queryKeys.adminProviders.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.adminProviders.detail(provider.id) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    void queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
  }

  return { syncProvider };
}

export function useApproveProvider() {
  const { syncProvider } = useProviderMutation();

  return useMutation({
    mutationFn: async (providerId: string) => {
      const response = await api.patch<ApiResponse<AdminProvider>>(
        API_ENDPOINTS.PROVIDERS.APPROVE(providerId),
      );
      return adminProviderSchema.parse(response.data.data);
    },
    onSuccess: syncProvider,
  });
}

export function useRejectProvider() {
  const { syncProvider } = useProviderMutation();

  return useMutation({
    mutationFn: async ({
      providerId,
      payload,
    }: {
      providerId: string;
      payload: RejectProviderData;
    }) => {
      const parsedPayload = rejectProviderSchema.parse(payload);
      const response = await api.patch<ApiResponse<AdminProvider>>(
        API_ENDPOINTS.PROVIDERS.REJECT(providerId),
        parsedPayload,
      );
      return adminProviderSchema.parse(response.data.data);
    },
    onSuccess: syncProvider,
  });
}

export function useSuspendProvider() {
  const { syncProvider } = useProviderMutation();

  return useMutation({
    mutationFn: async ({
      providerId,
      payload,
    }: {
      providerId: string;
      payload: SuspendProviderData;
    }) => {
      const parsedPayload = suspendProviderSchema.parse(payload);
      const response = await api.patch<ApiResponse<AdminProvider>>(
        API_ENDPOINTS.PROVIDERS.SUSPEND(providerId),
        parsedPayload,
      );
      return adminProviderSchema.parse(response.data.data);
    },
    onSuccess: syncProvider,
  });
}
