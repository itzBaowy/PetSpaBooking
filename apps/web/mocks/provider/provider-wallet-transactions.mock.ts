import type { ProviderLedgerTransactionMock, ProviderLedgerTransactionStatus, ProviderLedgerTransactionType } from "@/types/provider-wallet";

export const providerLedgerTypes: ProviderLedgerTransactionType[] = ["TOPUP", "RESERVE_COMMISSION", "RELEASE_RESERVE", "CHARGE_COMMISSION", "BOOKING_REVENUE", "PAYOUT", "DEBT_OFFSET", "WITHDRAWAL_REQUEST", "WITHDRAWAL_APPROVED", "WITHDRAWAL_REJECTED", "REFUND", "ADJUSTMENT"];
const statusList: ProviderLedgerTransactionStatus[] = ["completed", "pending", "failed", "reversed"];
const creditTypes = new Set<ProviderLedgerTransactionType>(["TOPUP", "RELEASE_RESERVE", "BOOKING_REVENUE", "WITHDRAWAL_REJECTED", "ADJUSTMENT"]);

export const providerWalletTransactionsMock: ProviderLedgerTransactionMock[] = Array.from({ length: 30 }, (_, index) => {
  const type = providerLedgerTypes[index % providerLedgerTypes.length]; const direction = creditTypes.has(type) ? "credit" as const : "debit" as const;
  const amount = 50000 + (index % 8) * 75000; const balanceBefore = 2200000 + index * 165000; const balanceAfter = direction === "credit" ? balanceBefore + amount : balanceBefore - amount;
  const bookingCode = ["RESERVE_COMMISSION", "RELEASE_RESERVE", "CHARGE_COMMISSION", "BOOKING_REVENUE", "REFUND"].includes(type) ? `PB-2607-${String(100 + index).padStart(4, "0")}` : undefined;
  return { id: `ledger-${index + 1}`, reference: `WLT-2607-${String(7001 + index).padStart(5, "0")}`, bookingCode, type, amount, direction, balanceBefore, balanceAfter, status: statusList[index % statusList.length], createdAt: new Date(2026, 6, 20 - (index % 18), 8 + (index % 10), index % 2 ? 30 : 0).toISOString(), description: transactionDescription(type), metadata: { source: "provider_wallet_mock", sequence: index + 1, currency: "VND", ...(bookingCode ? { bookingCode, commissionRate: 12 } : {}), reviewed: index % 3 === 0 } };
});

export async function getMockProviderWalletTransactions() { await new Promise<void>((resolve) => window.setTimeout(resolve, 550)); return structuredClone(providerWalletTransactionsMock); }
function transactionDescription(type: ProviderLedgerTransactionType) { return ({ TOPUP: "Commission deposit top-up", RESERVE_COMMISSION: "Commission reserved for cash booking", RELEASE_RESERVE: "Unused commission reserve released", CHARGE_COMMISSION: "Platform commission charged", BOOKING_REVENUE: "Booking revenue settled", PAYOUT: "Provider payout completed", DEBT_OFFSET: "Wallet debt offset", WITHDRAWAL_REQUEST: "Withdrawal request created", WITHDRAWAL_APPROVED: "Withdrawal request approved", WITHDRAWAL_REJECTED: "Rejected withdrawal returned", REFUND: "Customer refund adjustment", ADJUSTMENT: "Wallet balance adjustment" })[type]; }
