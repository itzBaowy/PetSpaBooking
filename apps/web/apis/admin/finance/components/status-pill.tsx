import { TRUST_RISK_LABELS } from "@/constants/trust-score";
import { cn } from "@/lib/utils";
import type { TrustRiskLevel } from "@/types/provider";

const riskStyles: Record<TrustRiskLevel, string> = {
  LOW: "border-success-soft bg-success-soft text-success",
  WATCH: "border-warning-soft bg-warning-soft text-warning",
  RESTRICTED: "border-danger-soft bg-danger-soft text-danger",
  SUSPENDED: "border-slate-200 bg-slate-100 text-slate-700",
};

export function RiskPill({ level }: { level: TrustRiskLevel }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
        riskStyles[level],
      )}
    >
      {TRUST_RISK_LABELS[level]}
    </span>
  );
}

export function FinanceStatusPill({
  children,
  tone = "default",
}: {
  children: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const styles = {
    default: "border-border-subtle bg-surface-muted text-muted",
    success: "border-success-soft bg-success-soft text-success",
    warning: "border-warning-soft bg-warning-soft text-warning",
    danger: "border-danger-soft bg-danger-soft text-danger",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
        styles,
      )}
    >
      {children}
    </span>
  );
}
