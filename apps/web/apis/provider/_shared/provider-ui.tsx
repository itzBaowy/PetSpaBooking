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

export function sortByDateDesc<T>(
  items: readonly T[],
  getDate: (item: T) => string | null | undefined,
) {
  return [...items].sort((a, b) => {
    const right = Date.parse(getDate(b) ?? "") || 0;
    const left = Date.parse(getDate(a) ?? "") || 0;
    return right - left;
  });
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
  RESOLVED_PROVIDER_WIN: "Provider thắng",
  RESOLVED_CUSTOMER_WIN: "Khách hàng thắng",
  RESOLVED: "Đã giải quyết",
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

export function providerStatusText(value?: string | null): string {
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
  const icon = getProviderPageIcon(title);

  return (
    <header className="relative flex flex-col justify-between gap-5 overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-r from-white via-emerald-50 to-teal-50 p-5 shadow-sm sm:p-7 lg:flex-row lg:items-center">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-emerald-200/25" />
        <span className="absolute right-8 top-2 rotate-12 text-6xl opacity-[0.07]">🐾</span>
        <span className="absolute bottom-0 right-48 -rotate-12 text-4xl opacity-[0.07]">🐾</span>
      </div>
      <div className="relative z-10 flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-2xl shadow-lg shadow-emerald-200" aria-hidden="true">
          {icon}
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Trung tâm nhà cung cấp</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
          {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="relative z-10 flex flex-wrap gap-2">{action}</div> : null}
    </header>
  );
}

function getProviderPageIcon(title: string) {
  const normalized = title.toLocaleLowerCase("vi-VN");
  if (normalized.includes("lịch") || normalized.includes("đặt")) return "📅";
  if (normalized.includes("dịch vụ")) return "✂️";
  if (normalized.includes("ví") || normalized.includes("giao dịch")) return "💳";
  if (normalized.includes("doanh thu") || normalized.includes("rút")) return "💰";
  if (normalized.includes("tranh chấp")) return "🛡️";
  if (normalized.includes("đánh giá")) return "⭐";
  if (normalized.includes("xác minh")) return "✅";
  if (normalized.includes("khách")) return "🐾";
  return "🐶";
}

export function ProviderLoading() {
  return (
    <div className="grid gap-3" aria-label="Đang tải">
      <div className="h-28 animate-pulse rounded-[28px] border border-emerald-100 bg-emerald-50" />
      <div className="h-52 animate-pulse rounded-2xl border border-slate-100 bg-white" />
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
    <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-12 text-center text-sm text-slate-500">
      <span className="mb-3 block text-4xl opacity-60" aria-hidden="true">🐾</span>
      <span className="font-medium">{text}</span>
    </div>
  );
}

export function ProviderPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(page, totalPages);
  const firstItem = pageSize && totalItems ? (page - 1) * pageSize + 1 : null;
  const lastItem = firstItem && pageSize && totalItems ? Math.min(firstItem + pageSize - 1, totalItems) : null;

  return (
    <nav className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm sm:flex-row" aria-label="Phân trang">
      <p className="text-xs font-medium text-slate-500">
        {firstItem && lastItem && totalItems
          ? `Hiển thị ${firstItem}–${lastItem} trong ${totalItems} kết quả`
          : `Trang ${page} / ${totalPages}`}
      </p>
      <div className="flex items-center gap-1.5">
        <PaginationButton disabled={page <= 1} label="Trang trước" onClick={() => onPageChange(page - 1)}>
          ←
        </PaginationButton>
        {visiblePages.map((item, index) =>
          item === "ellipsis" ? (
            <span className="grid h-9 w-7 place-items-center text-sm text-slate-400" key={`ellipsis-${index}`}>…</span>
          ) : (
            <PaginationButton active={item === page} key={item} label={`Trang ${item}`} onClick={() => onPageChange(item)}>
              {item}
            </PaginationButton>
          ),
        )}
        <PaginationButton disabled={page >= totalPages} label="Trang sau" onClick={() => onPageChange(page + 1)}>
          →
        </PaginationButton>
      </div>
    </nav>
  );
}

function PaginationButton({
  active = false,
  disabled = false,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
      }`}
    >
      {children}
    </button>
  );
}

function getVisiblePages(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  if (page >= totalPages - 3) return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
}

export function ProviderBadge({ value }: { value?: string | null }) {
  const normalized = value?.trim().toUpperCase() ?? "UNKNOWN";
  const tone = getProviderBadgeTone(normalized);

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none shadow-sm ${tone.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
      {providerStatusText(value)}
    </span>
  );
}

function getProviderBadgeTone(value: string) {
  if (["COMPLETED", "VERIFIED", "APPROVED", "SUCCESS", "PAID", "DEPOSITED"].includes(value)) {
    return { badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" };
  }

  if (["REJECTED", "CANCELLED", "CANCELED", "FAILED", "BANNED"].includes(value)) {
    return { badge: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" };
  }

  if (["PENDING", "PENDING_VERIFICATION", "PROCESSING", "UNPAID", "NOT_PAID"].includes(value)) {
    return { badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" };
  }

  if (["CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "ACTIVE"].includes(value)) {
    return { badge: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500" };
  }

  return { badge: "border-slate-200 bg-slate-50 text-slate-600", dot: "bg-slate-400" };
}
