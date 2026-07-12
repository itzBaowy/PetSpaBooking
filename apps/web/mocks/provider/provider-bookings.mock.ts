import type { ProviderBookingMock, ProviderBookingStatus, ProviderPaymentMethod, ProviderPaymentStatus } from "@/types/provider-booking";

const statuses: ProviderBookingStatus[] = ["pending", "confirmed", "checked_in", "checked_out", "completed", "cancelled", "rejected", "dispute", "no_arrival"];
const paymentStatuses: ProviderPaymentStatus[] = ["pending", "paid", "paid", "cash_pending", "paid", "refunded", "failed", "paid", "cash_pending"];
const paymentMethods: ProviderPaymentMethod[] = ["card", "bank_transfer", "cash", "wallet"];
const services = [
  ["Full Grooming Package", "Grooming", 90, 420000], ["Gentle Bath & Blow Dry", "Grooming", 60, 260000],
  ["Herbal Coat Spa", "Spa", 75, 350000], ["Basic Wellness Check", "Veterinary", 45, 300000],
] as const;
const customers = [["Nguyen Thu Linh", "Mochi", "Dog", "Poodle"], ["Tran Gia Bao", "Milo", "Cat", "British Shorthair"], ["Le Minh An", "Nala", "Dog", "Golden Retriever"], ["Pham Ha My", "Bun", "Cat", "Domestic Shorthair"]] as const;

export const providerBookingsMock: ProviderBookingMock[] = Array.from({ length: 18 }, (_, index) => {
  const status = statuses[index % statuses.length]; const service = services[index % services.length]; const person = customers[index % customers.length];
  const date = new Date(2026, 6, 14 + (index % 14), 8 + (index % 9), index % 2 ? 30 : 0);
  return {
    id: `booking-${index + 1}`, code: `PB-2607-${String(101 + index).padStart(4, "0")}`,
    customer: { name: person[0], phone: `+84 9${String(12345670 + index).padStart(8, "0")}`, email: `customer${index + 1}@petlink.vn` },
    pet: { name: person[1], type: person[2], breed: person[3], age: `${2 + (index % 6)} years`, size: index % 3 === 0 ? "Large" : index % 3 === 1 ? "Small" : "Medium", notes: index % 4 === 0 ? "Sensitive skin; use fragrance-free products." : undefined },
    service: { id: `service-${index % services.length + 1}`, name: service[0], category: service[1], duration: service[2], basePrice: service[3] },
    appointmentAt: date.toISOString(), paymentMethod: paymentMethods[index % paymentMethods.length], paymentStatus: paymentStatuses[index % paymentStatuses.length], status,
    totalAmount: service[3] + (index % 3) * 30000, commissionRate: 0.12, notes: index % 3 === 0 ? "Customer requests a calm handover and SMS update." : "No additional provider notes.",
    qrStatus: ["checked_in", "checked_out", "completed"].includes(status) ? "verified" : status === "confirmed" ? "issued" : "not_issued",
    otpStatus: ["checked_out", "completed"].includes(status) ? "verified" : status === "checked_in" ? "issued" : "not_issued",
    timeline: [
      { id: `timeline-created-${index}`, title: "Booking created", description: "Customer submitted the booking request.", occurredAt: new Date(date.getTime() - 86400000).toISOString(), actor: "Customer" },
      ...(status !== "pending" ? [{ id: `timeline-status-${index}`, title: status.replaceAll("_", " "), description: `Booking moved to ${status.replaceAll("_", " ")}.`, occurredAt: new Date(date.getTime() - 43200000).toISOString(), actor: "Provider" }] : []),
    ],
    dispute: status === "dispute" ? { id: `DSP-${600 + index}`, status: "under_review", reason: "Customer reported a difference from the agreed service scope.", deadline: new Date(date.getTime() + 172800000).toISOString() } : undefined,
  };
});

export async function getMockProviderBookings() { await delay(550); return structuredClone(providerBookingsMock); }
export async function getMockProviderBooking(id: string) { await delay(450); return structuredClone(providerBookingsMock.find((item) => item.id === id) ?? providerBookingsMock[0]); }
function delay(ms: number) { return new Promise<void>((resolve) => window.setTimeout(resolve, ms)); }
