import type { LedgerTransactionType } from "@/types/ledger";

export const LEDGER_TRANSACTION_TYPES = {
  TOPUP: "TOPUP",
  RESERVE_COMMISSION: "RESERVE_COMMISSION",
  RELEASE_RESERVE: "RELEASE_RESERVE",
  CHARGE_COMMISSION: "CHARGE_COMMISSION",
  PAYOUT: "PAYOUT",
  DEBT_OFFSET: "DEBT_OFFSET",
  ADMIN_ADJUSTMENT: "ADMIN_ADJUSTMENT",
} as const satisfies Record<LedgerTransactionType, LedgerTransactionType>;

export const LEDGER_TRANSACTION_TYPE_LABELS: Record<
  LedgerTransactionType,
  string
> = {
  TOPUP: "Nạp tiền",
  RESERVE_COMMISSION: "Giữ hoa hồng",
  RELEASE_RESERVE: "Hoàn giữ",
  CHARGE_COMMISSION: "Thu hoa hồng",
  PAYOUT: "Chi trả",
  DEBT_OFFSET: "Bù trừ nợ",
  ADMIN_ADJUSTMENT: "Điều chỉnh quản trị",
};
