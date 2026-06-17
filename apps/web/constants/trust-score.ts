import type { TrustRiskLevel } from "@/types/provider";

export const TRUST_RISK_LEVELS = {
  LOW: "LOW",
  WATCH: "WATCH",
  RESTRICTED: "RESTRICTED",
  SUSPENDED: "SUSPENDED",
} as const satisfies Record<TrustRiskLevel, TrustRiskLevel>;

export const TRUST_RISK_LABELS: Record<TrustRiskLevel, string> = {
  LOW: "Rủi ro thấp",
  WATCH: "Theo dõi",
  RESTRICTED: "Bị hạn chế",
  SUSPENDED: "Bị tạm khóa",
};

export const TRUST_RISK_THRESHOLDS = {
  low: 85,
  watch: 70,
  restricted: 50,
} as const;
