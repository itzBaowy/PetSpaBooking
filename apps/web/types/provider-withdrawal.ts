export type ProviderWithdrawalStatus = "pending" | "under_review" | "approved" | "rejected" | "paid" | "failed" | "cancelled";
export interface ProviderPayoutAccountMock { id: string; bankName: string; accountName: string; accountNumberMasked: string; isDefault: boolean; }
export interface ProviderWithdrawalMock { id: string; code: string; amount: number; fee: number; receivedAmount: number; payoutAccount: ProviderPayoutAccountMock; requestedAt: string; status: ProviderWithdrawalStatus; processedAt?: string; providerNote?: string; rejectionReason?: string; }
