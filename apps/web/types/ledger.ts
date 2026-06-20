export type LedgerTransactionType =
  | "TOPUP"
  | "RESERVE_COMMISSION"
  | "RELEASE_RESERVE"
  | "CHARGE_COMMISSION"
  | "PAYOUT"
  | "DEBT_OFFSET"
  | "ADMIN_ADJUSTMENT";

export type LedgerDirection = "CREDIT" | "DEBIT";

export interface LedgerTransactionMetadata {
  bookingId?: string;
  commissionId?: string;
  admin_id?: string;
  reason?: string;
  note?: string;
}

export interface LedgerTransaction {
  id: string;
  providerId: string;
  providerName: string;
  type: LedgerTransactionType;
  direction: LedgerDirection;
  amount: number;
  balanceAfter: number;
  createdAt: string;
  metadata: LedgerTransactionMetadata;
}
