import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatisticTone =
  | "default"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "purple"
  | "slate";

const toneStyles: Record<
  StatisticTone,
  { icon: string; value: string; border: string }
> = {
  default: {
    icon: "bg-surface-muted text-muted",
    value: "text-foreground",
    border: "border-border-subtle",
  },
  blue: {
    icon: "bg-brand-soft text-brand",
    value: "text-brand",
    border: "border-brand-soft",
  },
  green: {
    icon: "bg-success-soft text-success",
    value: "text-success",
    border: "border-success-soft",
  },
  amber: {
    icon: "bg-warning-soft text-warning",
    value: "text-warning",
    border: "border-warning-soft",
  },
  red: {
    icon: "bg-danger-soft text-danger",
    value: "text-danger",
    border: "border-danger-soft",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
    value: "text-purple-600",
    border: "border-purple-100",
  },
  slate: {
    icon: "bg-surface-soft text-muted",
    value: "text-foreground",
    border: "border-border-subtle",
  },
};

interface StatisticCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: StatisticTone;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
  footer?: ReactNode;
  className?: string;
  valueClassName?: string;
}

export function StatisticCard({
  title,
  value,
  icon,
  tone = "default",
  change,
  changeDirection = "neutral",
  footer,
  className,
  valueClassName,
}: StatisticCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border bg-surface p-4 shadow-sm transition-colors sm:p-5",
        styles.border,
        className,
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <p className="min-w-0 break-words text-sm font-medium text-muted">{title}</p>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              styles.icon,
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex min-w-0 flex-wrap items-end justify-between gap-3">
        <p
          className={cn(
            "min-w-0 break-words text-2xl font-bold tracking-tight sm:text-3xl",
            styles.value,
            valueClassName,
          )}
        >
          {value}
        </p>
        {change && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
              changeDirection === "up" && "bg-green-50 text-green-700",
              changeDirection === "down" && "bg-red-50 text-red-700",
              changeDirection === "neutral" && "bg-surface-muted text-muted",
            )}
          >
            {change}
          </span>
        )}
      </div>

      {footer && <div className="mt-2 text-xs text-subtle">{footer}</div>}
    </div>
  );
}

interface StatisticCardGridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function StatisticCardGrid({
  children,
  className,
  columns = 4,
}: StatisticCardGridProps) {
  const columnsClassName = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div
      className={cn(
        "grid gap-4",
        columnsClassName,
        className,
      )}
    >
      {children}
    </div>
  );
}
