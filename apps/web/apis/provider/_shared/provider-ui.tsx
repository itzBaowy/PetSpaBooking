"use client";

import type { ReactNode } from "react";
import axios from "axios";
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

const providerStatusLabels: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
  BANNED: "Đã bị khóa",
  SUSPENDED: "Đã tạm ngưng",
  PENDING: "Chờ xử lý",
  PENDING_VERIFICATION: "Chờ xác minh",
  VERIFIED: "Đã xác minh",
  APPROVED: "Đã phê duyệt",
  REJECTED: "Đã từ chối",
  CANCELLED: "Đã hủy",
  CANCELED: "Đã hủy",
  COMPLETED: "Đã hoàn tất",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  CHECKED_OUT: "Đã check-out",
  NO_ARRIVAL: "Khách không đến",
  NONE_ARRIVAL: "Khách không đến",
  DISPUTE: "Đang tranh chấp",
  PAID: "Đã thanh toán",
  UNPAID: "Chưa thanh toán",
  REFUNDED: "Đã hoàn tiền",
  FAILED: "Thất bại",
  SUCCESS: "Thành công",
  PROCESSING: "Đang xử lý",
  NOT_PAID: "Chưa nạp ký quỹ",
  DEPOSITED: "Đã nạp ký quỹ",
  WITHDRAWN: "Đã rút tiền",
  WITHDRAWAL: "Rút tiền",
  DEPOSIT: "Nạp tiền",
  PROVIDER_DEPOSIT: "Nạp ký quỹ",
  COMMISSION: "Hoa hồng",
  REFUND: "Hoàn tiền",
  CASH: "Tiền mặt",
  MOMO: "MoMo",
  BANK_TRANSFER: "Chuyển khoản",
  CREDIT_CARD: "Thẻ tín dụng",
  UNKNOWN: "Chưa xác định",
};

export function providerStatusText(value?: string | null) {
  if (!value) return providerStatusLabels.UNKNOWN;

  const prefixMatch = value.match(/^([^:]+):\s*(.+)$/);
  if (prefixMatch) {
    return `${prefixMatch[1]}: ${providerStatusText(prefixMatch[2])}`;
  }

  const normalized = value.trim().toUpperCase();
  return providerStatusLabels[normalized] ?? value.replaceAll("_", " ");
}

function getProviderFriendlyError(error: unknown) {
  if (!axios.isAxiosError(error)) return null;

  const rawMessage = String(error.response?.data?.message ?? error.message ?? "");
  const isDepositError =
    error.response?.status === 403 &&
    /provider deposit|deposit must be active|ACTIVE|VND|deposit/i.test(rawMessage);

  if (!isDepositError) return null;

  const minimumMatch = rawMessage.match(/at least\s+(\d+)\s*VND/i);
  const minimumText = minimumMatch
    ? providerMoney.format(Number(minimumMatch[1]))
    : "mức ký quỹ tối thiểu";

  return {
    title: "Bạn cần nạp ký quỹ để tiếp tục",
    message: `Bạn cần nạp ký quỹ tối thiểu ${minimumText} và đợi ký quỹ được kích hoạt trước khi dùng chức năng này.`,
  };
}

export function providerErrorText(error: unknown) {
  const friendly = getProviderFriendlyError(error);
  if (friendly) return friendly.message;

  if (axios.isAxiosError(error)) {
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
  const friendly = getProviderFriendlyError(error);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <h2 className="font-extrabold text-red-900">
        {friendly?.title ?? "Không tải được dữ liệu"}
      </h2>
      <p className="mt-2 text-sm text-red-700">{providerErrorText(error)}</p>
      <Button className="mt-4" onClick={retry}>
        Kiểm tra lại
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
      {providerStatusText(value)}
    </span>
  );
}
