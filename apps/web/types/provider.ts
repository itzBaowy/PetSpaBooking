export type TrustRiskLevel = "LOW" | "WATCH" | "RESTRICTED" | "SUSPENDED";

export interface ProviderBalance {
  availableBalance: number;
  reservedBalance: number;
  debtBalance: number;
  safetyBuffer: number;
  currency: "VND";
  lastUpdatedAt: string;
}

export interface ProviderTrustScore {
  score: number;
  riskLevel: TrustRiskLevel;
  completionRate: number;
  noShowRate: number;
  disputeRate: number;
  cashAbnormalityRate: number;
  lastCalculatedAt: string;
}

export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  balance?: ProviderBalance;
  trustScore?: ProviderTrustScore;
  createdAt: string;
  updatedAt: string;
}
