import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiEnvelope, ProviderPage } from "@/types/provider-api";

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export type DisputeEvidence = {
  url: string;
  type?: string;
  title?: string;
  note?: string;
  mimeType?: string;
  originalName?: string;
  size?: number;
};

export type ProviderDispute = {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  reason: string;
  description?: string | null;
  evidence: DisputeEvidence[];
  providerResponse?: string | null;
  providerEvidence: DisputeEvidence[];
  providerRespondedAt?: string | null;
  status: string;
  resolvedAt?: string | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id?: string;
    status?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    totalAmount?: number;
    checkedOutAt?: string | null;
    service?: { id?: string; name?: string };
    customer?: {
      id?: string;
      users?: {
        id?: string;
        userName?: string;
        fullName?: string;
        phone?: string;
      };
    };
  };
};

export type ProviderDisputeResponsePayload = {
  disputeId: string;
  response: string;
  evidenceFiles?: File[];
};

export const providerDisputeKeys = {
  all: ["provider", "disputes"] as const,
  list: (params?: object) => [...providerDisputeKeys.all, "list", params] as const,
  detail: (id: string) => [...providerDisputeKeys.all, "detail", id] as const,
};

export function useProviderDisputes(params: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: providerDisputeKeys.list(params),
    queryFn: async () =>
      unwrap<ProviderPage<ProviderDispute>>(
        await api.get(API_ENDPOINTS.MOBILE.PROVIDER.DISPUTES, { params }),
      ),
  });
}

export function useProviderDisputeDetail(disputeId: string) {
  return useQuery({
    queryKey: providerDisputeKeys.detail(disputeId),
    queryFn: async () =>
      unwrap<ProviderDispute>(
        await api.get(API_ENDPOINTS.MOBILE.PROVIDER.DISPUTE_DETAIL(disputeId)),
      ),
    enabled: Boolean(disputeId),
  });
}

export function useRespondProviderDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ disputeId, response, evidenceFiles = [] }: ProviderDisputeResponsePayload) => {
      const formData = new FormData();
      formData.append("response", response);
      evidenceFiles.forEach((file) => formData.append("evidenceFiles", file));

      return unwrap<ProviderDispute>(
        await api.post(API_ENDPOINTS.MOBILE.PROVIDER.DISPUTE_RESPONSE(disputeId), formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
      );
    },
    onSuccess: (dispute) => {
      void queryClient.invalidateQueries({ queryKey: providerDisputeKeys.all });
      if (dispute?.id) {
        queryClient.setQueryData(providerDisputeKeys.detail(dispute.id), dispute);
      }
    },
  });
}
