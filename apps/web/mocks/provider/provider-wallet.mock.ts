import type { ProviderDepositStatus, ProviderWalletMock } from "@/types/provider-wallet";

const transactions: ProviderWalletMock["transactions"] = [
  { id: "txn-1", reference: "TXN-2607-1042", type: "booking_income", description: "Full Grooming Package · PB-2607-0108", amount: 369600, direction: "credit", status: "completed", occurredAt: "2026-07-18T16:40:00+07:00" },
  { id: "txn-2", reference: "TXN-2607-1039", type: "commission_charge", description: "Platform commission · PB-2607-0108", amount: 50400, direction: "debit", status: "completed", occurredAt: "2026-07-18T16:39:00+07:00" },
  { id: "txn-3", reference: "TXN-2607-1021", type: "deposit", description: "Commission deposit top-up", amount: 1000000, direction: "credit", status: "completed", occurredAt: "2026-07-16T09:20:00+07:00" },
  { id: "txn-4", reference: "TXN-2607-1012", type: "withdrawal", description: "Withdrawal to bank ending 4821", amount: 2500000, direction: "debit", status: "pending", occurredAt: "2026-07-15T14:05:00+07:00" },
  { id: "txn-5", reference: "TXN-2607-1007", type: "refund", description: "Customer refund adjustment · PB-2607-0091", amount: 180000, direction: "debit", status: "completed", occurredAt: "2026-07-14T11:35:00+07:00" },
];
const settlements: ProviderWalletMock["pendingSettlements"] = [
  { id: "settlement-1", bookingCode: "PB-2607-0114", serviceName: "Herbal Coat Spa", grossAmount: 350000, commission: 42000, netAmount: 308000, expectedAt: "2026-07-19T15:30:00+07:00", status: "dispute_window" },
  { id: "settlement-2", bookingCode: "PB-2607-0111", serviceName: "Gentle Bath & Blow Dry", grossAmount: 260000, commission: 31200, netAmount: 228800, expectedAt: "2026-07-20T10:00:00+07:00", status: "processing" },
];

export const providerWalletStates: Record<ProviderDepositStatus, ProviderWalletMock> = {
  active: { status: "active", availableBalance: 8420000, pendingBalance: 536800, reservedCommission: 126000, depositBalance: 1650000, debtBalance: 0, withdrawableBalance: 7910000, minimumDeposit: 1000000, cashBookingEligible: true, transactions, pendingSettlements: settlements },
  not_paid: { status: "not_paid", availableBalance: 420000, pendingBalance: 228800, reservedCommission: 0, depositBalance: 0, debtBalance: 0, withdrawableBalance: 420000, minimumDeposit: 1000000, cashBookingEligible: false, transactions: transactions.slice(0, 2), pendingSettlements: settlements.slice(1) },
  low_balance: { status: "low_balance", availableBalance: 3120000, pendingBalance: 308000, reservedCommission: 215000, depositBalance: 185000, debtBalance: 0, withdrawableBalance: 2905000, minimumDeposit: 1000000, cashBookingEligible: false, transactions: transactions.slice(0, 4), pendingSettlements: settlements },
  restricted: { status: "restricted", availableBalance: 980000, pendingBalance: 0, reservedCommission: 0, depositBalance: 0, debtBalance: 640000, withdrawableBalance: 0, minimumDeposit: 1000000, cashBookingEligible: false, transactions: transactions.slice(2), pendingSettlements: [] },
};

export const providerDepositMock = {
  currentBalance: providerWalletStates.low_balance.depositBalance,
  minimumRecommendedBalance: 1000000,
  lowBalanceThreshold: 300000,
  suggestedAmounts: [500000, 1000000, 2000000, 5000000],
  paymentMethods: [
    { value: "bank_transfer", label: "Bank transfer", description: "Mock transfer from a linked business bank account." },
    { value: "momo", label: "MoMo", description: "Demo option only. No MoMo request is created." },
    { value: "vnpay", label: "VNPay", description: "Demo option only. No VNPay checkout is opened." },
  ],
};

export async function getMockProviderWallet(status: ProviderDepositStatus = "active") { await new Promise<void>((resolve) => window.setTimeout(resolve, 550)); return structuredClone(providerWalletStates[status]); }
