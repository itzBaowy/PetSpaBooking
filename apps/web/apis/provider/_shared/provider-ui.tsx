"use client";

import type { ReactNode } from "react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";

export const providerMoney = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function providerDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function providerErrorText(error: unknown) {
  if (error instanceof AxiosError) {
    return String(error.response?.data?.message ?? error.message);
  }
  if (error instanceof Error) return error.message;
  return "Không thể tải dữ liệu. Vui lòng thử lại.";
}

export function ProviderPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col justify-between gap-4 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center">
      <div>
        <h1 className="text-2xl font-black text-foreground sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </header>
  );
}

export function ProviderLoading() {
  return (
    <div className="grid gap-3" aria-label="Đang tải">
      <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="h-52 animate-pulse rounded-2xl bg-surface-muted" />
    </div>
  );
}

export function ProviderError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <h2 className="font-extrabold text-red-900">Không tải được dữ liệu</h2>
      <p className="mt-2 text-sm text-red-700">{providerErrorText(error)}</p>
      <Button className="mt-4" onClick={retry}>
        Thử lại
      </Button>
    </div>
  );
}

export function ProviderEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-muted bg-surface p-12 text-center text-sm text-muted">
      {text}
    </div>
  );
}

export function ProviderBadge({ value }: { value?: string | null }) {
  return (
    <span className="inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-xs font-extrabold text-brand">
      {(value || "UNKNOWN").replaceAll("_", " ")}
    </span>
  );
}
