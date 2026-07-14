import { useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiEnvelope } from "@/types/provider-api";
import type { DisputeEvidence } from "@/apis/provider/disputes/queries";

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export type CreateBookingDisputePayload = {
  bookingId: string;
  reason: string;
  description?: string;
  evidence?: DisputeEvidence[];
};

export type CreatedBookingDispute = {
  id: string;
  bookingId: string;
  reason: string;
  description?: string | null;
  evidence: DisputeEvidence[];
  status: string;
  createdAt: string;
};

export function useCreateBookingDispute() {
  return useMutation({
    mutationFn: async ({ bookingId, reason, description, evidence = [] }: CreateBookingDisputePayload) =>
      unwrap<CreatedBookingDispute>(
        await api.post(API_ENDPOINTS.MOBILE.BOOKINGS.CREATE_DISPUTE(bookingId), {
          reason,
          ...(description ? { description } : {}),
          evidence,
        }),
      ),
  });
}
