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
  reason: z.string().min(10, "Reason must be at least 10 characters."),
});

export const debtActionSchema = z.object({
  providerId: z.string().min(1),
  action: z.enum(["MARK_RESOLVED", "FORCE_OFFSET", "ESCALATE"]),
  reason: z.string().min(10),
});

export type BalanceAdjustmentData = z.infer<typeof balanceAdjustmentSchema>;
export type DebtActionData = z.infer<typeof debtActionSchema>;

export const withdrawalDecisionSchema = z.object({
  requestId: z.string().min(1),
  decision: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().min(10, "Lý do phải có ít nhất 10 ký tự"),
});

export const depositConfigSchema = z.object({
  minimumDeposit: z.number().min(0),
  warningThreshold: z.number().min(0),
  restrictionThreshold: z.number().min(0),
  commissionRate: z.number().min(0).max(100),
});

export type WithdrawalDecisionData = z.infer<typeof withdrawalDecisionSchema>;
export type DepositConfigData = z.infer<typeof depositConfigSchema>;
