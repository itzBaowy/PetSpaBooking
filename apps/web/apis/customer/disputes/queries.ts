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
  evidenceFiles?: File[];
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
    mutationFn: async ({ bookingId, reason, description, evidenceFiles = [] }: CreateBookingDisputePayload) => {
      const formData = new FormData();
      formData.append("reason", reason);
      if (description) formData.append("description", description);
      evidenceFiles.forEach((file) => formData.append("evidenceFiles", file));

      return unwrap<CreatedBookingDispute>(
        await api.post(API_ENDPOINTS.MOBILE.BOOKINGS.CREATE_DISPUTE(bookingId), formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
      );
    },
  });
}
