import { COMMISSION_STATUS_LABELS } from "@/constants/commission";
import { cn } from "@/lib/utils";
import type { CommissionDisplayStatus } from "@/types/commission";

const statusStyles: Record<CommissionDisplayStatus, string> = {
  PENDING: "border-warning-soft bg-warning-soft text-warning",
  CHARGED: "border-success-soft bg-success-soft text-success",
  RELEASED: "border-brand-soft bg-brand-soft text-brand",
  FAILED: "border-danger-soft bg-danger-soft text-danger",
  REFUND_PENDING: "border-warning-soft bg-warning-soft text-warning",
  REFUNDED: "border-brand-soft bg-brand-soft text-brand",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-700",
};

const statusLabels: Record<CommissionDisplayStatus, string> = {
  ...COMMISSION_STATUS_LABELS,
  REFUND_PENDING: "Chờ hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
  CANCELLED: "Đã hủy",
};

export function CommissionStatusPill({
  status,
}: {
  status: CommissionDisplayStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
