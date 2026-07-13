import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type {
  ApiEnvelope,
  ProviderServiceApi,
  ProviderServicePage,
} from "@/types/provider-api";

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const serviceKeys = {
  all: ["provider", "services"] as const,
  list: () => [...serviceKeys.all, "list"] as const,
};

export type ProviderServicePayload = {
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  imageUrls?: string[];
};

export function useProviderServices() {
  return useQuery({
    queryKey: serviceKeys.list(),
    queryFn: async () => {
      type RawServicePage = Omit<ProviderServicePage, "items"> & {
        items: Array<Omit<ProviderServiceApi, "category"> & { category?: string | null }>;
      };
      const page = unwrap<RawServicePage>(
        await api.get(API_ENDPOINTS.SERVICES.MY, {
          params: { page: 1, pageSize: 100 },
        }),
      );
      return {
        ...page,
        items: page.items.map((item) => ({
          ...item,
          category: item.category ? { name: item.category } : null,
        })),
      } satisfies ProviderServicePage;
    },
  });
}

export function useSaveProviderService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id?: string;
      payload: ProviderServicePayload;
    }) => {
      const response = id
        ? await api.put<ApiEnvelope<ProviderServiceApi>>(API_ENDPOINTS.SERVICES.UPDATE(id), payload)
        : await api.post<ApiEnvelope<ProviderServiceApi>>(API_ENDPOINTS.SERVICES.CREATE, payload);
      return unwrap(response);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

export function useToggleProviderService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap<ProviderServiceApi>(await api.patch(API_ENDPOINTS.SERVICES.TOGGLE(id))),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

export function useDeleteProviderService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap<unknown>(await api.delete(API_ENDPOINTS.SERVICES.DELETE(id))),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}
