"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AdminBookingStatus, DisputeResolutionData } from "./schema";

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
  },
  {
    id: "BK-92002",
    petOwner: "An Tran",
    provider: "VetCare 24h",
    service: "Vaccination",
    scheduledAt: "2026-06-14 11:00",
    amount: 420000,
    status: "IN_PROGRESS",
    paymentStatus: "PAID",
  },
  {
    id: "BK-91970",
    petOwner: "Bao Le",
    provider: "Pet Hotel Luna",
    service: "Overnight Stay",
    scheduledAt: "2026-06-13 19:00",
    amount: 950000,
    status: "CANCELLED",
    paymentStatus: "REFUNDED",
    disputeStatus: "RESOLVED",
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

export const adminBookingKeys = {
  all: ["admin", "bookings"] as const,
  lists: () => [...adminBookingKeys.all, "list"] as const,
  disputes: () => [...adminBookingKeys.all, "disputes"] as const,
};

export function useAdminBookingList() {
  return useQuery<AdminBooking[]>({
    queryKey: adminBookingKeys.lists(),
    queryFn: async () => {
      const response = await api.get<AdminBooking[]>("/admin/bookings");
      return response.data;
    },
    initialData: adminBookingMockItems,
  });
}

export function useBookingDisputes() {
  return useQuery<BookingDispute[]>({
    queryKey: adminBookingKeys.disputes(),
    queryFn: async () => {
      const response = await api.get<BookingDispute[]>("/admin/bookings/disputes");
      return response.data;
    },
    initialData: disputeMockItems,
  });
}

export function useResolveBookingDispute() {
  return useMutation({
    mutationFn: async (payload: DisputeResolutionData) => {
      const response = await api.post("/admin/bookings/disputes/resolve", payload);
      return response.data as { success: boolean; auditLogId: string };
    },
  });
}
