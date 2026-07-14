export type CommissionStatus = "PENDING" | "CHARGED" | "RELEASED" | "FAILED";

export type CommissionDisplayStatus =
  | CommissionStatus
  | "REFUND_PENDING"
  | "REFUNDED"
  | "CANCELLED";

export type CommissionType = "PERCENTAGE" | "FIXED";

export type CommissionScope = "GLOBAL" | "SERVICE_CATEGORY" | "PROVIDER_TYPE";

export interface Commission {
  id: string;
  bookingId: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  bookingAmount: number;
  heldAmount: number;
  commissionAmount: number;
  providerEarning: number;
  rateLabel: string;
  status: CommissionStatus;
  displayStatus: CommissionDisplayStatus;
  fundSource: string;
  fundStatus: string;
  paymentMethod: PaymentMethod | "ONLINE";
  reservedAt?: string;
  chargedAt?: string;
  releasedAt?: string;
  failedAt?: string;
  collectedFrom?: string | null;
  failureReason?: string | null;
  releaseReason?: string | null;
}

export interface CommissionConfig {
  id: string;
  name: string;
  type: CommissionType;
  scope: CommissionScope;
  scopeValue: string;
  value: number;
  effectiveFrom: string;
  appliesToNewBookingsOnly: true;
  isActive: boolean;
}
import type { PaymentMethod } from "@/types/payment";
