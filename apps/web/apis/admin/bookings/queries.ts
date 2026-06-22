import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { bookingStatusOverrideSchema, noShowResolutionSchema } from "./schema";
import type {
  AdminBookingStatus,
  BookingStatusOverrideData,
  DisputeResolutionData,
  NoShowResolutionData,
} from "./schema";

export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
export type DisputeStatus = "OPEN" | "REVIEWING" | "RESOLVED";

export interface AdminBooking {
  id: string;
  petOwner: string;
  provider: string;
  service: string;
  scheduledAt: string;
  amount: number;
  status: AdminBookingStatus;
  paymentStatus: PaymentStatus;
  disputeStatus?: DisputeStatus;
  paymentMethod: "CASH" | "ONLINE_MOMO";
  commissionReserved?: number;
}

export interface BookingDispute {
  id: string;
  bookingId: string;
  petOwner: string;
  provider: string;
  issue: string;
  requestedOutcome: "REFUND" | "STATUS_CHANGE" | "QUALITY_REVIEW";
  status: DisputeStatus;
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
  status: "AWAITING_OWNER" | "READY_FOR_ADMIN" | "ESCALATED";
}

export const adminBookingMockItems: AdminBooking[] = [
  {
    id: "BK-92018",
    petOwner: "Minh Nguyen",
    provider: "Happy Paws Spa",
    service: "Premium Grooming",
    scheduledAt: "2026-06-14 15:30",
    amount: 680000,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    disputeStatus: "OPEN",
    paymentMethod: "CASH",
    commissionReserved: 102000,
  },
  {
    id: "BK-92002",
    petOwner: "An Tran",
    provider: "VetCare 24h",
    service: "Vaccination",
    scheduledAt: "2026-06-14 11:00",
    amount: 420000,
    status: "CHECKED_IN",
    paymentStatus: "PAID",
    paymentMethod: "CASH",
    commissionReserved: 63000,
  },
  {
    id: "BK-91970",
    petOwner: "Bao Le",
    provider: "Pet Hotel Luna",
    service: "Overnight Stay",
    scheduledAt: "2026-06-13 19:00",
    amount: 950000,
    status: "REJECTED",
    paymentStatus: "REFUNDED",
    disputeStatus: "RESOLVED",
    paymentMethod: "ONLINE_MOMO",
  },
  {
    id: "BK-91942",
    petOwner: "Linh Vo",
    provider: "Paws & Claws Spa",
    service: "Basic Bath",
    scheduledAt: "2026-06-12 09:00",
    amount: 300000,
    status: "NONE_ARRIVAL",
    paymentStatus: "UNPAID",
    paymentMethod: "CASH",
    commissionReserved: 45000,
  },
  {
    id: "BK-91912",
    petOwner: "Duy Pham",
    provider: "Animal Wellness Center",
    service: "Health Check",
    scheduledAt: "2026-06-11 08:30",
    amount: 520000,
    status: "COMPLETED",
    paymentStatus: "PAID",
    paymentMethod: "CASH",
    commissionReserved: 78000,
  },
];

export const disputeMockItems: BookingDispute[] = [
  {
    id: "DSP-5014",
    bookingId: "BK-92018",
    petOwner: "Minh Nguyen",
    provider: "Happy Paws Spa",
    issue: "Pet owner reports incomplete grooming package after online payment.",
    requestedOutcome: "REFUND",
    status: "OPEN",
    lastAuditLog: "Created by ADMIN queue at 2026-06-14 10:40",
  },
  {
    id: "DSP-4988",
    bookingId: "BK-91970",
    petOwner: "Bao Le",
    provider: "Pet Hotel Luna",
    issue: "Provider cancelled due to overbooking; refund completed.",
    requestedOutcome: "STATUS_CHANGE",
    status: "RESOLVED",
    lastAuditLog: "Refund approved by ADMIN at 2026-06-13 21:05",
  },
];

export const noShowMockItems: NoShowReview[] = [
  {
    id: "NS-3001",
    bookingId: "BK-91942",
    petOwner: "Linh Vo",
    provider: "Paws & Claws Spa",
    service: "Basic Bath",
    reportedAt: "2026-06-12 09:20",
    providerEvidence: "Provider uploaded front desk camera timestamp and OTP log.",
    ownerResponse: "Owner says they arrived late but did not check in.",
    reserveAmount: 45000,
    status: "READY_FOR_ADMIN",
  },
  {
    id: "NS-3002",
    bookingId: "BK-91880",
    petOwner: "Gia Han",
    provider: "Pet Hotel & Daycare",
    service: "Daycare",
    reportedAt: "2026-06-10 16:30",
    providerEvidence: "Provider notes no QR scan before appointment expiry.",
    ownerResponse: "Waiting for pet owner response.",
    reserveAmount: 72000,
    status: "AWAITING_OWNER",
  },
];

export const adminBookingKeys = {
  all: ["admin", "bookings"] as const,
  lists: () => [...adminBookingKeys.all, "list"] as const,
  disputes: () => [...adminBookingKeys.all, "disputes"] as const,
  noShows: () => [...adminBookingKeys.all, "no-shows"] as const,
};

export function useAdminBookings() {
  return useQuery<AdminBooking[]>({
    queryKey: adminBookingKeys.lists(),
    queryFn: async () => {
      const response = await api.get<AdminBooking[]>("/admin/bookings");
      return response.data;
    },
    initialData: adminBookingMockItems,
    enabled: false,
  });
}

export function useNoShowReviews() {
  return useQuery<NoShowReview[]>({
    queryKey: adminBookingKeys.noShows(),
    queryFn: async () => {
      const response = await api.get<NoShowReview[]>(
        "/admin/bookings/no-show",
      );
      return response.data;
    },
    initialData: noShowMockItems,
    enabled: false,
  });
}

export function useDisputeBookings() {
  return useQuery<BookingDispute[]>({
    queryKey: adminBookingKeys.disputes(),
    queryFn: async () => {
      const response = await api.get<BookingDispute[]>(
        "/admin/bookings/disputes",
      );
      return response.data;
    },
    initialData: disputeMockItems,
    enabled: false,
  });
}

export function useResolveBookingDispute() {
  return useMutation({
    mutationFn: async (payload: DisputeResolutionData) => {
      const response = await api.post(
        "/admin/bookings/disputes/resolve",
        payload,
      );
      return response.data as { success: boolean; auditLogId: string };
    },
  });
}

export function useResolveNoShowReview() {
  return useMutation({
    mutationFn: async (payload: NoShowResolutionData) => {
      const parsedPayload = noShowResolutionSchema.parse(payload);
      const response = await api.post<{ success: boolean; auditLogId: string }>(
        "/admin/bookings/no-show/resolve",
        parsedPayload,
      );
      return response.data;
    },
  });
}

export function useOverrideBookingStatus() {
  return useMutation({
    mutationFn: async (payload: BookingStatusOverrideData) => {
      const parsedPayload = bookingStatusOverrideSchema.parse(payload);
      const response = await api.patch<{ success: boolean; auditLogId: string }>(
        `/admin/bookings/${parsedPayload.bookingId}/status`,
        parsedPayload,
      );
      return response.data;
    },
  });
}
