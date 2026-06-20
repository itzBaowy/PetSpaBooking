import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  backHref,
  backLabel = "Back",
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-3 inline-flex text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            {backLabel}
          </Link>
        )}
        {eyebrow && (
          <nav className="mb-1 text-xs font-semibold uppercase tracking-wider text-subtle">
            {eyebrow}
          </nav>
        )}
        <h1 className="wrap-break-word text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <div className="mt-2 max-w-3xl text-sm text-muted">
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
