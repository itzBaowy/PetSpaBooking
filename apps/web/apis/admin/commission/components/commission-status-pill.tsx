import { COMMISSION_STATUS_LABELS } from "@/constants/commission";
import { cn } from "@/lib/utils";
import type { CommissionStatus } from "@/types/commission";

const statusStyles: Record<CommissionStatus, string> = {
  PENDING: "border-warning-soft bg-warning-soft text-warning",
  CHARGED: "border-success-soft bg-success-soft text-success",
  RELEASED: "border-brand-soft bg-brand-soft text-brand",
  FAILED: "border-danger-soft bg-danger-soft text-danger",
};

export function CommissionStatusPill({
  status,
}: {
  status: CommissionStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
        statusStyles[status],
      )}
    >
      {COMMISSION_STATUS_LABELS[status]}
    </span>
  );
}
