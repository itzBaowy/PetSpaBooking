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
    icon: "bg-gray-50 text-gray-600",
    value: "text-gray-900",
    border: "border-gray-100",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600",
    value: "text-blue-600",
    border: "border-blue-100",
  },
  green: {
    icon: "bg-green-50 text-green-600",
    value: "text-green-600",
    border: "border-green-100",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    value: "text-amber-600",
    border: "border-amber-100",
  },
  red: {
    icon: "bg-red-50 text-red-600",
    value: "text-red-600",
    border: "border-red-100",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
    value: "text-purple-600",
    border: "border-purple-100",
  },
  slate: {
    icon: "bg-slate-50 text-slate-600",
    value: "text-slate-700",
    border: "border-slate-100",
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
        "rounded-xl border bg-white p-5 shadow-sm transition-colors",
        styles.border,
        className,
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <p className="min-w-0 text-sm font-medium text-gray-500">{title}</p>
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
            "min-w-0 break-words text-3xl font-bold tracking-tight",
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
              changeDirection === "neutral" && "bg-gray-50 text-gray-600",
            )}
          >
            {change}
          </span>
        )}
      </div>

      {footer && <div className="mt-2 text-xs text-gray-400">{footer}</div>}
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
    3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
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
