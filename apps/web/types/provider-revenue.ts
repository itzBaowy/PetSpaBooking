export type RevenuePaymentMethod = "cash" | "card" | "bank_transfer" | "wallet";
export interface ProviderRevenueBookingMock { id: string; code: string; completedAt: string; service: string; paymentMethod: RevenuePaymentMethod; grossAmount: number; commission: number; netAmount: number; settlementStatus: "pending" | "completed"; }
export interface ProviderRevenueSettlementMock { id: string; reference: string; period: string; grossAmount: number; commission: number; netAmount: number; status: "pending" | "processing" | "completed"; expectedAt: string; completedAt?: string; }
export interface ProviderRevenueTrendPoint { date: string; gross: number; net: number; }
