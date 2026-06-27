export type CommissionStatus = "PENDING" | "CHARGED" | "RELEASED" | "FAILED";

export type CommissionType = "PERCENTAGE" | "FIXED";

export type CommissionScope = "GLOBAL" | "SERVICE_CATEGORY" | "PROVIDER_TYPE";

export interface Commission {
  id: string;
  bookingId: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  bookingAmount: number;
  commissionAmount: number;
  rateLabel: string;
  status: CommissionStatus;
  paymentMethod: PaymentMethod;
  reservedAt?: string;
  chargedAt?: string;
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
