import type { BookingStatus } from "@/constants/booking-status";

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  scheduledAt: string;
  duration: number;
  totalPrice: number;
  status: BookingStatus;
  paymentMethod?: "CASH" | "ONLINE_MOMO";
  cancelledBy?: "PET_OWNER" | "SERVICE_PROVIDER" | "ADMIN";
  cancelReason?: string;
  checkedInAt?: string;
  noShowReportedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
