import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiEnvelope, ProviderBookingApi, ProviderPage } from "@/types/provider-api";

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const bookingKeys = {
  all: ["provider", "bookings"] as const,
  list: (params?: object) => [...bookingKeys.all, "list", params] as const,
  detail: (id: string) => [...bookingKeys.all, "detail", id] as const,
};

export type ProviderBookingAction =
  | "confirm"
  | "reject"
  | "cancel"
  | "no-arrival"
  | "check-in"
  | "check-out";

export function useProviderBookings(params: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: async () =>
      unwrap<ProviderPage<ProviderBookingApi>>(
        await api.get(API_ENDPOINTS.MOBILE.PROVIDER.BOOKINGS, { params }),
      ),
  });
}

export function useProviderBookingDetail(bookingId: string) {
  return useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: async () => {
      const page = unwrap<ProviderPage<ProviderBookingApi>>(
        await api.get(API_ENDPOINTS.MOBILE.PROVIDER.BOOKINGS, {
          params: { page: 1, pageSize: 100 },
        }),
      );
      const booking = page.items.find((item) => item.id === bookingId);
      if (!booking) throw new Error("Không tìm thấy lịch đặt trong danh sách provider.");
      return booking;
    },
  });
}

export function useProviderBookingAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      reason,
      qrToken,
    }: {
      id: string;
      action: ProviderBookingAction;
      reason?: string;
      qrToken?: string;
    }) => {
      const endpoint =
        action === "confirm"
          ? API_ENDPOINTS.MOBILE.PROVIDER.CONFIRM_BOOKING(id)
          : action === "reject"
            ? API_ENDPOINTS.MOBILE.PROVIDER.REJECT_BOOKING(id)
            : action === "cancel"
              ? API_ENDPOINTS.MOBILE.PROVIDER.CANCEL_BOOKING(id)
              : action === "no-arrival"
                ? API_ENDPOINTS.MOBILE.PROVIDER.NO_ARRIVAL(id)
                : action === "check-in"
                  ? API_ENDPOINTS.MOBILE.PROVIDER.CHECK_IN(id)
                  : API_ENDPOINTS.MOBILE.PROVIDER.CHECK_OUT(id);
      const body = action === "check-in" || action === "check-out" ? { qrToken } : { reason };
      const response =
        action === "check-in" || action === "check-out"
          ? await api.post<ApiEnvelope<ProviderBookingApi>>(endpoint, body)
          : await api.patch<ApiEnvelope<ProviderBookingApi>>(endpoint, body);
      return unwrap(response);
    },
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      if (booking?.id) {
        queryClient.setQueryData(bookingKeys.detail(booking.id), booking);
      }
    },
  });
}
