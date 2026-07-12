export type ProviderBookingStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "completed" | "cancelled" | "rejected" | "dispute" | "no_arrival";
export type ProviderPaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cash_pending";
export type ProviderPaymentMethod = "card" | "bank_transfer" | "cash" | "wallet";

export interface ProviderBookingTimelineItem { id: string; title: string; description: string; occurredAt: string; actor: string; }
export interface ProviderBookingMock {
  id: string; code: string; customer: { name: string; phone: string; email: string; avatar?: string };
  pet: { name: string; type: string; breed: string; age: string; size: string; notes?: string };
  service: { id: string; name: string; category: string; duration: number; basePrice: number };
  appointmentAt: string; paymentMethod: ProviderPaymentMethod; paymentStatus: ProviderPaymentStatus;
  status: ProviderBookingStatus; totalAmount: number; commissionRate: number; notes?: string;
  qrStatus: "not_issued" | "issued" | "verified"; otpStatus: "not_issued" | "issued" | "verified";
  timeline: ProviderBookingTimelineItem[];
  dispute?: { id: string; status: "open" | "under_review"; reason: string; deadline: string };
}
