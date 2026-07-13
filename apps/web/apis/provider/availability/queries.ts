import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type {
  ApiEnvelope,
  AvailabilityBlockApi,
  AvailabilityBlockPayload,
  WorkingHourApi,
} from "@/types/provider-api";

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const availabilityKeys = {
  all: ["provider", "availability"] as const,
  hours: () => [...availabilityKeys.all, "working-hours"] as const,
  blocks: () => [...availabilityKeys.all, "blocks"] as const,
};

export function useProviderWorkingHours() {
  return useQuery({
    queryKey: availabilityKeys.hours(),
    queryFn: async () =>
      unwrap<WorkingHourApi[]>(await api.get(API_ENDPOINTS.MOBILE.PROVIDER.WORKING_HOURS)),
  });
}

export function useProviderAvailabilityBlocks() {
  return useQuery({
    queryKey: availabilityKeys.blocks(),
    queryFn: async () =>
      unwrap<AvailabilityBlockApi[]>(
        await api.get(API_ENDPOINTS.MOBILE.PROVIDER.AVAILABILITY_BLOCKS),
      ),
  });
}

export function useSaveProviderWorkingHours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: WorkingHourApi[]) =>
      unwrap<WorkingHourApi[]>(
        await api.put(API_ENDPOINTS.MOBILE.PROVIDER.WORKING_HOURS, { items }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: availabilityKeys.hours() });
    },
  });
}

export function useCreateProviderAvailabilityBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AvailabilityBlockPayload) =>
      unwrap<AvailabilityBlockApi>(
        await api.post(API_ENDPOINTS.MOBILE.PROVIDER.AVAILABILITY_BLOCKS, payload),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: availabilityKeys.blocks() });
    },
  });
}

export function useDeleteProviderAvailabilityBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap<unknown>(
        await api.delete(API_ENDPOINTS.MOBILE.PROVIDER.DELETE_AVAILABILITY_BLOCK(id)),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: availabilityKeys.blocks() });
    },
  });
}
