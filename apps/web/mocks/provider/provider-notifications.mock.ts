import type { ProviderNotificationMock, ProviderNotificationType } from "@/types/provider-notification";

const definitions: Array<[ProviderNotificationType, string, string, string]> = [
  ["verification_update", "Verification approved", "Your provider verification has been approved.", "/provider/verification"],
  ["new_booking", "New booking request", "Nguyen Thu Linh requested Full Grooming Package for Mochi.", "/provider/bookings/booking-1"],
  ["booking_cancelled", "Booking cancelled", "Booking PB-2607-0112 was cancelled by the customer.", "/provider/bookings/booking-2"],
  ["upcoming_booking", "Appointment in 60 minutes", "Milo's Herbal Coat Spa appointment starts soon.", "/provider/bookings/booking-3"],
  ["new_message", "New customer message", "Le Minh An sent a message about Nala's appointment.", "/provider/communication/chat"],
  ["dispute_update", "Dispute response required", "Dispute DSP-2607-0602 is awaiting your response.", "/provider/disputes/dispute-2"],
  ["withdrawal_update", "Withdrawal approved", "Withdrawal WD-2607-0303 has been approved.", "/provider/wallet/withdrawals"],
  ["low_balance", "Deposit balance is low", "Add funds to continue accepting cash bookings.", "/provider/wallet/deposit"],
  ["service_moderation", "Service requires changes", "Herbal Coat Spa needs a clearer service description.", "/provider/services/service-3/edit"],
];
export const providerNotificationsMock: ProviderNotificationMock[] = Array.from({ length: 18 }, (_, index) => { const [type, title, message, route] = definitions[index % definitions.length]; return { id: `notification-${index + 1}`, type, title, message, route, reference: `NTF-2607-${String(801 + index).padStart(4, "0")}`, createdAt: new Date(2026, 6, 21 - (index % 8), 8 + (index % 10), index % 2 ? 30 : 0).toISOString(), read: index % 3 === 0 }; });
