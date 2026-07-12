import type { ProviderPayoutAccountMock, ProviderWithdrawalMock, ProviderWithdrawalStatus } from "@/types/provider-withdrawal";

export const providerPayoutAccountsMock: ProviderPayoutAccountMock[] = [
  { id: "account-1", bankName: "Vietcombank", accountName: "NGUYEN MINH ANH", accountNumberMasked: "•••• 4821", isDefault: true },
  { id: "account-2", bankName: "Techcombank", accountName: "PAWS AND RELAX CO LTD", accountNumberMasked: "•••• 7306", isDefault: false },
];
export const providerWithdrawalConfigMock = { withdrawableBalance: 7910000, minimumWithdrawal: 200000, feeRate: 0.005, maximumFee: 50000 };
const statuses: ProviderWithdrawalStatus[] = ["pending", "under_review", "approved", "rejected", "paid", "failed", "cancelled"];
export const providerWithdrawalsMock: ProviderWithdrawalMock[] = Array.from({ length: 14 }, (_, index) => { const amount = 500000 + (index % 6) * 400000; const fee = Math.min(amount * providerWithdrawalConfigMock.feeRate, providerWithdrawalConfigMock.maximumFee); const status = statuses[index % statuses.length]; return { id: `withdrawal-${index + 1}`, code: `WD-2607-${String(301 + index).padStart(4, "0")}`, amount, fee, receivedAmount: amount - fee, payoutAccount: providerPayoutAccountsMock[index % providerPayoutAccountsMock.length], requestedAt: new Date(2026, 6, 20 - index, 9 + index % 7).toISOString(), status, processedAt: ["approved", "rejected", "paid", "failed", "cancelled"].includes(status) ? new Date(2026, 6, 21 - index, 14).toISOString() : undefined, providerNote: index % 2 ? "Monthly operating payout." : "Transfer to primary business account.", rejectionReason: status === "rejected" ? "Payout account name does not match the verified business profile." : undefined }; });
export async function getMockProviderWithdrawals() { await new Promise<void>((resolve) => window.setTimeout(resolve, 500)); return structuredClone(providerWithdrawalsMock); }
