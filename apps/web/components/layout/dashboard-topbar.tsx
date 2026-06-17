"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

type DashboardTopbarRole = "admin" | "provider";

const notifications = [
  {
    title: "Hồ sơ nhà cung cấp chờ duyệt",
    detail: "4 yêu cầu cần được xem xét",
    tone: "bg-amber-50 text-amber-700",
  },
  {
    title: "Có tranh chấp mới",
    detail: "Đặt lịch BK-92002 cần quản trị xử lý",
    tone: "bg-red-50 text-red-700",
  },
  {
    title: "Dịch vụ bị báo cáo đang chờ kiểm duyệt",
    detail: "Dịch vụ Tắm cơ bản có báo cáo mới",
    tone: "bg-blue-50 text-blue-700",
  },
  {
    title: "Thanh toán thất bại",
    detail: "Thử thanh toán lại thất bại cho BK-91988",
    tone: "bg-orange-50 text-orange-700",
  },
  {
    title: "Nhật ký kiểm toán quan trọng",
    detail: "Hành động hoàn tiền đã được ghi nhận để rà soát",
    tone: "bg-surface-soft text-foreground",
  },
];

const profileMeta: Record<
  DashboardTopbarRole,
  { initials: string; name: string; email: string; roleLabel: string }
> = {
  admin: {
    initials: "SA",
    name: "Super Admin",
    email: "admin@petlink.vn",
    roleLabel: "Quản trị viên",
  },
  provider: {
    initials: "AN",
    name: "Anh Nguyen",
    email: "owner@happypaws.vn",
    roleLabel: "Nhà cung cấp dịch vụ",
  },
};

function BellIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
      />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export function DashboardTopbar({ role }: { role: DashboardTopbarRole }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profile = profileMeta[role];

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-end border-b border-shell-border bg-shell-strong px-5 shadow-sm">
      <div aria-hidden="true" className="min-w-0 flex-1" />

      <div className="flex shrink-0 items-center gap-3">
        <div className="relative">
          <button
            type="button"
            aria-label="Mở thông báo"
            aria-haspopup="menu"
            aria-expanded={isNotificationsOpen}
            onBlur={() =>
              window.setTimeout(() => setIsNotificationsOpen(false), 120)
            }
            onClick={() => {
              setIsNotificationsOpen((current) => !current);
              setIsProfileOpen(false);
            }}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-shell-border bg-shell text-shell-muted shadow-sm transition-colors hover:bg-shell-border hover:text-white focus:outline-none focus:ring-4 focus:ring-brand/20"
          >
            <BellIcon />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-xl shadow-gray-900/10">
              <div className="border-b border-border-subtle px-4 py-3">
                <p className="text-sm font-bold text-foreground">
                  Thông báo
                </p>
                <p className="text-xs text-muted">
                  5 mục cần chú ý
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto p-1.5">
                {notifications.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    className="flex w-full gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-surface-muted"
                  >
                    <span
                      className={cn(
                        "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full",
                        item.tone,
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {item.detail}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Mở menu hồ sơ"
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            onBlur={() => window.setTimeout(() => setIsProfileOpen(false), 120)}
            onClick={() => {
              setIsProfileOpen((current) => !current);
              setIsNotificationsOpen(false);
            }}
            className="inline-flex h-10 items-center gap-3 rounded-xl border border-shell-border bg-shell py-1 pl-1 pr-3 text-left shadow-sm transition-colors hover:bg-shell-border focus:outline-none focus:ring-4 focus:ring-brand/20"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
              {profile.initials}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block text-sm font-bold leading-4 text-white">
                {profile.name}
              </span>
              <span className="block text-xs font-medium text-shell-muted">
                {profile.roleLabel}
              </span>
            </span>
            <ChevronIcon isOpen={isProfileOpen} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-xl shadow-gray-900/10">
              <div className="border-b border-border-subtle p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-sm font-bold text-brand-foreground">
                    {profile.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {profile.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {profile.email}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-brand">
                      {profile.roleLabel}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-1.5">
                <Link
                  href={`/${role}/profile`}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
                >
                  Hồ sơ
                </Link>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
                >
                  Cài đặt
                </button>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-danger transition-colors hover:bg-danger-soft"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
