export type PaymentMethod = "CASH" | "MOMO" | "VNPAY";

export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Tiền mặt",
  MOMO: "MoMo",
  VNPAY: "VNPay",
};
