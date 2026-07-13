import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiEnvelope } from "@/types/provider-api";

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export type ProviderReviewApi = {
  id: string;
  bookingId: string;
  rating: number;
  comment?: string | null;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
  user?: {
    id?: string;
    name?: string | null;
    avatarUrl?: string | null;
  };
};

export type ProviderReviewListApi = {
  responseReviews: ProviderReviewApi[];
  page: number;
  pageSize: number;
  total: number;
};

export const providerReviewKeys = {
  all: ["provider", "reviews"] as const,
  list: (providerId?: string, page?: number) =>
    [...providerReviewKeys.all, providerId, page] as const,
};

export function useProviderPublicReviews(providerId?: string, page = 1) {
  return useQuery({
    queryKey: providerReviewKeys.list(providerId, page),
    enabled: Boolean(providerId),
    queryFn: async () =>
      unwrap<ProviderReviewListApi>(
        await api.get(API_ENDPOINTS.MOBILE.PUBLIC.PROVIDER_REVIEWS(providerId!), {
          params: { page, pageSize: 20 },
        }),
      ),
    retry: false,
  });
}
