import type {
  CommissionScope,
  CommissionStatus,
  CommissionType,
} from "@/types/commission";

export const COMMISSION_STATUSES = {
  PENDING: "PENDING",
  CHARGED: "CHARGED",
  RELEASED: "RELEASED",
  FAILED: "FAILED",
} as const satisfies Record<CommissionStatus, CommissionStatus>;

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  PENDING: "Chờ xử lý",
  CHARGED: "Đã thu",
  RELEASED: "Đã xử lý",
  FAILED: "Thất bại",
};

export const COMMISSION_TYPES = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
} as const satisfies Record<CommissionType, CommissionType>;

export const COMMISSION_SCOPES = {
  GLOBAL: "GLOBAL",
  SERVICE_CATEGORY: "SERVICE_CATEGORY",
  PROVIDER_TYPE: "PROVIDER_TYPE",
} as const satisfies Record<CommissionScope, CommissionScope>;
