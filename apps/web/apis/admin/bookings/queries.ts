import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { listSchema, nested, textValue } from "@/apis/admin/supported-api";
import type {
  AdminBookingStatus,
  BookingStatusOverrideData,
  DisputeResolutionData,
  NoShowResolutionData,
} from "./schema";

export type DisputeStatus =
  | "PENDING"
  | "RESOLVED_PROVIDER_WIN"
  | "RESOLVED_CUSTOMER_WIN"
  | "CANCELLED";

export interface AdminBooking {
  id: string;
  petOwner: string;
  provider: string;
  service: string;
  scheduledAt: string;
  amount: number;
  status: AdminBookingStatus | string;
  paymentStatus: string;
  paymentMethod: string;
  disputeStatus?: string;
}

export interface BookingDispute {
  id: string;
  bookingId: string;
  petOwner: string;
  provider: string;
  issue: string;
  requestedOutcome: string;
  status: DisputeStatus | string;
  lastAuditLog: string;
}

export interface NoShowReview {
  id: string;
  bookingId: string;
  petOwner: string;
  provider: string;
  service: string;
  reportedAt: string;
  providerEvidence: string;
  ownerResponse: string;
  reserveAmount: number;
  status: "READY_FOR_ADMIN";
}

export const adminBookingKeys = {
  all: ["admin", "bookings"] as const,
  lists: () => [...adminBookingKeys.all, "list"] as const,
  disputes: () => [...adminBookingKeys.all, "disputes"] as const,
  noShows: () => [...adminBookingKeys.all, "no-shows"] as const,
};

function toList<T>(data: unknown) {
  return listSchema.parse(data).items as T[];
}

type DefinedQuery<T> = UseQueryResult<T, unknown> & { data: T };

function withDefault<T>(query: UseQueryResult<T, unknown>, fallback: T): DefinedQuery<T> {
  return { ...query, data: query.data ?? fallback } as DefinedQuery<T>;
}

function normalizeBooking(booking: Record<string, unknown>): AdminBooking {
  return {
    id: textValue(booking.id, ""),
    petOwner: textValue(booking.customerName ?? nested(booking, "customer", "users", "fullName")),
    provider: textValue(booking.providerName ?? nested(booking, "provider", "businessName")),
    service: textValue(booking.serviceName ?? nested(booking, "service", "name")),
    scheduledAt: textValue(booking.scheduledAt ?? booking.startTime ?? booking.bookingTime),
    amount: Number(booking.totalAmount ?? booking.amount ?? 0),
    status: textValue(booking.status, "PENDING"),
    paymentStatus: textValue(booking.paymentStatus, "UNPAID"),
    paymentMethod: textValue(booking.paymentMethod, "-"),
    disputeStatus: booking.disputeStatus ? String(booking.disputeStatus) : undefined,
  };
}

export function useAdminBookings() {
  const query = useQuery<AdminBooking[]>({
    queryKey: adminBookingKeys.lists(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.BOOKINGS.LIST);
      return toList<Record<string, unknown>>(response.data.data).map(normalizeBooking);
    },
    placeholderData: [],
  });
  return withDefault(query, []);
}

export function useNoShowReviews() {
  const query = useQuery<NoShowReview[]>({
    queryKey: adminBookingKeys.noShows(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.BOOKINGS.LIST, {
        params: { status: "NO_ARRIVAL", page: 1, pageSize: 100 },
      });
      return toList<Record<string, unknown>>(response.data.data).map((booking) => ({
        id: String(booking.id ?? ""),
        bookingId: String(booking.id ?? ""),
        petOwner: textValue(booking.customerName ?? nested(booking, "customer", "users", "fullName")),
        provider: textValue(booking.providerName ?? nested(booking, "provider", "businessName")),
        service: textValue(booking.serviceName ?? nested(booking, "service", "name")),
        reportedAt: String(booking.noArrivalAt ?? booking.updateAt ?? ""),
        providerEvidence: "Backend chưa có evidence riêng cho no-arrival.",
        ownerResponse: "Backend chưa có phản hồi khách hàng riêng cho no-arrival.",
        reserveAmount: Number(booking.totalAmount ?? 0),
        status: "READY_FOR_ADMIN",
      }));
    },
    placeholderData: [],
  });
  return withDefault(query, []);
}

export function useDisputeBookings() {
  const query = useQuery<BookingDispute[]>({
    queryKey: adminBookingKeys.disputes(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.DISPUTES.LIST);
      return toList<Record<string, unknown>>(response.data.data).map((dispute) => ({
        id: textValue(dispute.id, ""),
        bookingId: textValue(dispute.bookingId ?? nested(dispute, "booking", "id")),
        petOwner: textValue(dispute.customerName ?? nested(dispute, "booking", "customer", "users", "fullName")),
        provider: textValue(dispute.providerName ?? nested(dispute, "booking", "provider", "businessName")),
        issue: textValue(dispute.reason ?? dispute.issue ?? dispute.description),
        requestedOutcome: textValue(dispute.requestedOutcome ?? dispute.type, "REVIEW"),
        status: textValue(dispute.status, "PENDING"),
        lastAuditLog: textValue(dispute.adminNote ?? dispute.updatedAt ?? dispute.createAt),
      }));
    },
    placeholderData: [],
  });
  return withDefault(query, []);
}

export function useResolveBookingDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DisputeResolutionData) => {
      const status =
        payload.result === "REFUND"
          ? "RESOLVED_CUSTOMER_WIN"
          : payload.result === "CLOSE_CLAIM"
            ? "CANCELLED"
            : "RESOLVED_PROVIDER_WIN";
      const response = await api.patch<ApiResponse<unknown>>(
        API_ENDPOINTS.ADMIN.DISPUTES.RESOLVE(payload.disputeId),
        { status, adminNote: payload.auditNote },
      );
      return response.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminBookingKeys.all });
    },
  });
}

export function useResolveNoShowReview() {
  return useMutation({
    mutationFn: async (payload: NoShowResolutionData) => {
      void payload;
      throw new Error("Backend chưa có API xử lý no-arrival review riêng.");
    },
  });
}

export function useOverrideBookingStatus() {
  return useMutation({
    mutationFn: async (payload: BookingStatusOverrideData) => {
      void payload;
      throw new Error("Backend chưa có API override booking status trực tiếp.");
    },
  });
}
