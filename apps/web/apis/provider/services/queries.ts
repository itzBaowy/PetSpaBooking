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
  list: (params?: object) => [...serviceKeys.all, "list", params] as const,
};

export type ProviderServicePayload = {
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  imageUrls?: string[];
};

export function useProviderServices(params: { page: number; pageSize: number } = { page: 1, pageSize: 100 }) {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: async () => {
      type RawServicePage = Omit<ProviderServicePage, "items"> & {
        items: Array<Omit<ProviderServiceApi, "category"> & { category?: string | null }>;
      };
      const page = unwrap<RawServicePage>(
        await api.get(API_ENDPOINTS.SERVICES.MY, {
          params,
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

function getUploadedImageUrls(payload: unknown): string[] {
  if (Array.isArray(payload)) {
    return payload.flatMap((item) =>
      typeof item === "string"
        ? [item]
        : item && typeof item === "object" && "url" in item && typeof item.url === "string"
          ? [item.url]
          : [],
    );
  }
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["imageUrls", "urls", "images", "data"]) {
    const urls = getUploadedImageUrls(record[key]);
    if (urls.length) return urls;
  }
  return [];
}

export function useUploadProviderServiceImages() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      const response = await api.post(API_ENDPOINTS.SERVICES.UPLOAD_IMAGES, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const urls = getUploadedImageUrls(response.data);
      if (!urls.length) throw new Error("API upload ảnh không trả về URL.");
      return urls;
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
