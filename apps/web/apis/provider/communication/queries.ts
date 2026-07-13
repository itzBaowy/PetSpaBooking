import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type {
  ApiEnvelope,
  ProviderChatMessageApi,
  ProviderChatThreadApi,
  ProviderPage,
} from "@/types/provider-api";

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const communicationKeys = {
  all: ["provider", "communication"] as const,
  threads: (params?: object) => [...communicationKeys.all, "threads", params] as const,
  bookingThread: (bookingId: string) => [...communicationKeys.all, "booking-thread", bookingId] as const,
  messages: (threadId: string, params?: object) =>
    [...communicationKeys.all, "messages", threadId, params] as const,
};

export function useProviderChatThreads(params: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: communicationKeys.threads(params),
    queryFn: async () =>
      unwrap<ProviderPage<ProviderChatThreadApi>>(
        await api.get(API_ENDPOINTS.MOBILE.PROVIDER.CHAT_THREADS, { params }),
      ),
  });
}

export function useProviderBookingChatThread(bookingId?: string) {
  return useQuery({
    queryKey: communicationKeys.bookingThread(bookingId ?? ""),
    enabled: Boolean(bookingId),
    queryFn: async () =>
      unwrap<ProviderChatThreadApi>(
        await api.get(API_ENDPOINTS.MOBILE.PROVIDER.CHAT_THREAD_FOR_BOOKING(bookingId!)),
      ),
  });
}

export function useProviderChatMessages(
  threadId?: string,
  params: Record<string, string | number | undefined> = { page: 1, pageSize: 50 },
) {
  return useQuery({
    queryKey: communicationKeys.messages(threadId ?? "", params),
    enabled: Boolean(threadId),
    queryFn: async () =>
      unwrap<ProviderPage<ProviderChatMessageApi>>(
        await api.get(API_ENDPOINTS.MOBILE.PROVIDER.CHAT_MESSAGES(threadId!), { params }),
      ),
  });
}

export function useSendProviderChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ threadId, content }: { threadId: string; content: string }) =>
      unwrap<ProviderChatMessageApi>(
        await api.post(API_ENDPOINTS.MOBILE.PROVIDER.CHAT_MESSAGES(threadId), { content }),
      ),
    onSuccess: (_message, variables) => {
      void queryClient.invalidateQueries({
        queryKey: communicationKeys.messages(variables.threadId),
      });
      void queryClient.invalidateQueries({ queryKey: communicationKeys.all });
    },
  });
}

export function useMarkProviderChatRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) =>
      api.patch(API_ENDPOINTS.MOBILE.PROVIDER.MARK_CHAT_READ(threadId)),
    onSuccess: (_result, threadId) => {
      void queryClient.invalidateQueries({
        queryKey: communicationKeys.messages(threadId),
      });
      void queryClient.invalidateQueries({ queryKey: communicationKeys.all });
    },
  });
}
