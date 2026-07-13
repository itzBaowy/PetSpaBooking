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
        "mb-2 flex flex-col gap-4 px-5 pb-3 pt-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8",
        className,
      )}
    >
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-4 inline-flex text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            {backLabel}
          </Link>
        )}
        {eyebrow && (
          <nav className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted/70">
            {eyebrow}
          </nav>
        )}
        <h1 className="break-words text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <div className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex w-full flex-wrap items-center gap-2 pt-0.5 sm:w-auto lg:pt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
