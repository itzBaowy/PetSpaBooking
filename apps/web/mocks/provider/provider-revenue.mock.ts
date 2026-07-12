import type { ProviderRevenueBookingMock, ProviderRevenueSettlementMock } from "@/types/provider-revenue";

export const providerRevenueServices = ["Full Grooming Package", "Gentle Bath & Blow Dry", "Herbal Coat Spa", "Basic Wellness Check"];
const paymentMethods = ["cash", "card", "bank_transfer", "wallet"] as const;
export const providerRevenueBookingsMock: ProviderRevenueBookingMock[] = Array.from({ length: 42 }, (_, index) => {
  const grossAmount = 240000 + (index % 7) * 55000; const commission = Math.round(grossAmount * 0.12); const date = new Date(2026, 6, 1 + (index % 21), 9 + (index % 8), index % 2 ? 30 : 0);
  return { id: `revenue-booking-${index + 1}`, code: `PB-2607-${String(501 + index).padStart(4, "0")}`, completedAt: date.toISOString(), service: providerRevenueServices[index % providerRevenueServices.length], paymentMethod: paymentMethods[index % paymentMethods.length], grossAmount, commission, netAmount: grossAmount - commission, settlementStatus: index % 4 === 0 ? "pending" : "completed" };
});
export const providerRevenueSettlementsMock: ProviderRevenueSettlementMock[] = [
  { id: "set-1", reference: "SET-2607-018", period: "18 Jul 2026", grossAmount: 1680000, commission: 201600, netAmount: 1478400, status: "pending", expectedAt: "2026-07-22T10:00:00+07:00" },
  { id: "set-2", reference: "SET-2607-017", period: "17 Jul 2026", grossAmount: 2140000, commission: 256800, netAmount: 1883200, status: "processing", expectedAt: "2026-07-21T16:00:00+07:00" },
  { id: "set-3", reference: "SET-2607-016", period: "16 Jul 2026", grossAmount: 1920000, commission: 230400, netAmount: 1689600, status: "completed", expectedAt: "2026-07-18T12:00:00+07:00", completedAt: "2026-07-18T11:42:00+07:00" },
  { id: "set-4", reference: "SET-2607-015", period: "15 Jul 2026", grossAmount: 1570000, commission: 188400, netAmount: 1381600, status: "completed", expectedAt: "2026-07-17T12:00:00+07:00", completedAt: "2026-07-17T10:15:00+07:00" },
];
export async function getMockProviderRevenue() { await new Promise<void>((resolve) => window.setTimeout(resolve, 550)); return { bookings: structuredClone(providerRevenueBookingsMock), settlements: structuredClone(providerRevenueSettlementsMock) }; }
