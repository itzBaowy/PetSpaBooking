export type ProviderDepositStatus = "not_paid" | "active" | "low_balance" | "restricted";
export type ProviderWalletTransactionType = "deposit" | "booking_income" | "commission_reserve" | "commission_charge" | "withdrawal" | "refund";

export interface ProviderWalletTransactionMock { id: string; reference: string; type: ProviderWalletTransactionType; description: string; amount: number; direction: "credit" | "debit"; status: "completed" | "pending" | "failed"; occurredAt: string; }
export interface ProviderPendingSettlementMock { id: string; bookingCode: string; serviceName: string; grossAmount: number; commission: number; netAmount: number; expectedAt: string; status: "dispute_window" | "processing"; }
export interface ProviderWalletMock { status: ProviderDepositStatus; availableBalance: number; pendingBalance: number; reservedCommission: number; depositBalance: number; debtBalance: number; withdrawableBalance: number; minimumDeposit: number; cashBookingEligible: boolean; transactions: ProviderWalletTransactionMock[]; pendingSettlements: ProviderPendingSettlementMock[]; }

export type ProviderLedgerTransactionType = "TOPUP" | "RESERVE_COMMISSION" | "RELEASE_RESERVE" | "CHARGE_COMMISSION" | "BOOKING_REVENUE" | "PAYOUT" | "DEBT_OFFSET" | "WITHDRAWAL_REQUEST" | "WITHDRAWAL_APPROVED" | "WITHDRAWAL_REJECTED" | "REFUND" | "ADJUSTMENT";
export type ProviderLedgerTransactionStatus = "completed" | "pending" | "failed" | "reversed";
export interface ProviderLedgerTransactionMock { id: string; reference: string; bookingCode?: string; type: ProviderLedgerTransactionType; amount: number; direction: "credit" | "debit"; balanceBefore: number; balanceAfter: number; status: ProviderLedgerTransactionStatus; createdAt: string; description: string; metadata: Record<string, string | number | boolean>; }
