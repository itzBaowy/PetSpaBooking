import { z } from "zod";

export const ledgerTransactionTypeSchema = z.enum([
  "TOPUP",
  "RESERVE_COMMISSION",
  "RELEASE_RESERVE",
  "CHARGE_COMMISSION",
  "PAYOUT",
  "DEBT_OFFSET",
  "ADMIN_ADJUSTMENT",
]);

export const balanceAdjustmentSchema = z.object({
  providerId: z.string().min(1, "Provider is required."),
  amount: z.number().min(1000, "Adjustment amount must be at least 1,000 VND."),
  direction: z.enum(["CREDIT", "DEBIT"]),
  ledgerType: z.literal("ADMIN_ADJUSTMENT"),
  admin_id: z.string().min(1, "Admin id is required."),
  reason: z.string().min(10, "Reason must be at least 10 characters."),
});

export const debtActionSchema = z.object({
  providerId: z.string().min(1),
  action: z.enum(["MARK_RESOLVED", "FORCE_OFFSET", "ESCALATE"]),
  reason: z.string().min(10),
});

export type BalanceAdjustmentData = z.infer<typeof balanceAdjustmentSchema>;
export type DebtActionData = z.infer<typeof debtActionSchema>;
