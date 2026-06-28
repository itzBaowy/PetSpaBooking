"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProfile } from "@/apis/auth/queries";
import { ThemeMenuItem } from "@/components/ui/theme-menu-item";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type DashboardTopbarRole = "admin" | "provider";

const notifications = [
  ["Hồ sơ nhà cung cấp chờ duyệt", "4 yêu cầu cần được xem xét", "bg-warning"],
  [
    "Có tranh chấp mới",
    "Đặt lịch BK-92002 cần quản trị viên xử lý",
    "bg-danger",
  ],
  [
    "Dịch vụ đang chờ kiểm duyệt",
    "Dịch vụ Tắm cơ bản có báo cáo mới",
    "bg-info",
  ],
  ["Thanh toán thất bại", "Thanh toán lại thất bại cho BK-91988", "bg-warning"],
  [
    "Nhật ký kiểm toán quan trọng",
    "Hành động hoàn tiền cần được rà soát",
    "bg-brand",
  ],
] as const;

const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị viên",
  PROVIDER: "Nhà cung cấp dịch vụ",
  CUSTOMER: "Khách hàng",
};

function Icon({ type }: { type: "bell" | "user" | "activity" | "logout" }) {
  const paths = {
    bell:
      "M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h11Zm0 0a3 3 0 1 1-6 0",
    user:
      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    activity: "M3 3v18h18M7 15l3-3 3 2 5-6",
    logout:
      "m10 17 5-5-5-5m5 5H3m11-9h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5",
  };

  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={paths[type]}
      />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m19 9-7 7-7-7"
      />
    </svg>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardTopbar({ role }: { role: DashboardTopbarRole }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<"notifications" | "profile" | null>(
    null,
  );
  const { data: profile } = useProfile();
  const clearTokens = useAuthStore((state) => state.clearTokens);

  const displayName =
    profile?.fullName ||
    profile?.userName ||
    (role === "admin" ? "Admin" : "Provider");
  const displayEmail = profile?.email ?? "Đang tải...";
  const displayRole = profile?.role
    ? roleLabels[profile.role] ?? profile.role
    : role === "admin"
      ? "Quản trị viên"
      : "Nhà cung cấp dịch vụ";
  const initials = getInitials(displayName);

  const closeSoon = (menu: "notifications" | "profile") =>
    window.setTimeout(() => {
      setOpenMenu((prev) => (prev === menu ? null : prev));
    }, 150);

  function handleLogout() {
    clearTokens();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-end border-b border-shell-border bg-shell-strong px-5 shadow-sm backdrop-blur dark:bg-shell-strong">
      <div className="relative">
        <button
          type="button"
          aria-label="Mở thông báo"
          aria-haspopup="menu"
          aria-expanded={openMenu === "notifications"}
          onBlur={() => closeSoon("notifications")}
          onClick={() =>
            setOpenMenu(openMenu === "notifications" ? null : "notifications")
          }
          className="relative mr-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-shell-border bg-surface text-muted shadow-sm transition hover:border-brand hover:bg-brand-soft hover:text-brand focus:outline-none focus:ring-4 focus:ring-brand/20 dark:bg-shell dark:text-shell-muted"
        >
          <Icon type="bell" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-shell bg-danger" />
        </button>

        {openMenu === "notifications" && (
          <div className="absolute right-3 top-12 z-50 w-80 overflow-hidden rounded-xl border border-border-subtle bg-surface text-foreground shadow-xl">
            <div className="border-b border-border-subtle px-4 py-3">
              <p className="text-sm font-bold">Thông báo</p>
              <p className="text-xs text-muted">5 mục cần chú ý</p>
            </div>
            <div className="max-h-80 overflow-y-auto p-1.5">
              {notifications.map(([title, detail, tone]) => (
                <button
                  key={title}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  className="flex w-full gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-brand-soft"
                >
                  <span
                    className={cn(
                      "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                      tone,
                    )}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {detail}
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
          aria-expanded={openMenu === "profile"}
          onBlur={() => closeSoon("profile")}
          onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")}
          className="inline-flex h-10 items-center gap-3 rounded-xl border border-shell-border bg-surface py-1 pl-1 pr-3 text-left text-muted shadow-sm transition hover:border-brand hover:bg-brand-soft hover:text-brand focus:outline-none focus:ring-4 focus:ring-brand/20 dark:bg-shell dark:text-shell-muted"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
            {initials}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block text-sm font-bold leading-4 text-foreground dark:text-white">
              {displayName}
            </span>
            <span className="block text-xs font-medium text-shell-muted">
              {displayRole}
            </span>
          </span>
          <Chevron open={openMenu === "profile"} />
        </button>

        {openMenu === "profile" && (
          <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-xl border border-border-subtle bg-surface text-foreground shadow-xl">
            <div className="border-b border-border-subtle p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-sm font-bold text-brand">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{displayName}</p>
                  <p className="truncate text-xs text-muted">{displayEmail}</p>
                  <p className="mt-1 text-xs font-semibold text-brand">
                    {displayRole}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-0.5 p-1.5">
              <Link
                href={`/${role}/profile`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-brand-soft hover:text-brand"
              >
                <Icon type="user" /> Hồ sơ
              </Link>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground transition hover:bg-brand-soft hover:text-brand"
              >
                <Icon type="activity" /> Nhật ký hoạt động
              </button>
              <ThemeMenuItem />
              <div className="my-1 border-t border-border-subtle" />
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-danger transition hover:bg-danger-soft"
              >
                <Icon type="logout" /> Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
