import type { BookingStatus } from "@/constants/booking-status";
import type { PaymentMethod } from "@/types/payment";

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  scheduledAt: string;
  duration: number;
  totalPrice: number;
  status: BookingStatus;
  paymentMethod?: PaymentMethod;
  cancelledBy?: "CUSTOMER" | "PROVIDER" | "ADMIN";
  cancelReason?: string;
  checkedInAt?: string;
  noShowReportedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
