"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/apis/auth/queries";
import type { AdminEntity } from "@/apis/admin/supported-api";
import { Avatar, getAvatarInitials } from "@/components/ui/avatar";
import { useTopbarNotifications } from "@/hooks/use-topbar-notifications";
import { useAuthStore } from "@/stores/auth-store";
import { NotificationDetailModal } from "./topbar/notification-detail-modal";
import { NotificationMenu } from "./topbar/notification-menu";
import { ProfileMenu } from "./topbar/profile-menu";
import { SendNotificationModal } from "./topbar/send-notification-modal";
import { TopbarChevron, TopbarIcon } from "./topbar/topbar-icons";
import type { DashboardTopbarRole } from "./topbar/types";

const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị viên",
  PROVIDER: "Nhà cung cấp dịch vụ",
  CUSTOMER: "Khách hàng",
};

export function DashboardTopbar({ role }: { role: DashboardTopbarRole }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<"notifications" | "profile" | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<AdminEntity | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const { data: profile } = useProfile();
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const {
    query: notificationQuery,
    groupedNotifications,
    totalNotifications,
    unreadCount,
  } = useTopbarNotifications({
    role,
    userId: profile?.id,
  });
  const displayUnreadCount = unreadCount;

  const displayName = profile?.fullName || profile?.userName || (role === "admin" ? "Admin" : "Provider");
  const displayEmail = profile?.email ?? "Đang tải...";
  const displayRole = profile?.role ? roleLabels[profile.role] ?? profile.role : role === "admin" ? "Quản trị viên" : "Nhà cung cấp dịch vụ";
  const initials = getAvatarInitials(displayName);

  const closeSoon = (menu: "profile") =>
    window.setTimeout(() => setOpenMenu((prev) => (prev === menu ? null : prev)), 150);

  function handleLogout() {
    clearTokens();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-end border-b border-shell-border bg-shell-strong px-5 shadow-sm backdrop-blur dark:bg-shell-strong">
      <div className="relative">
        {role === "admin" && (
          <button
            type="button"
            aria-label="Gửi thông báo"
            onClick={() => setSendOpen(true)}
            className="mr-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-shell-border bg-surface text-muted shadow-sm transition hover:border-brand hover:bg-brand-soft hover:text-brand focus:outline-none focus:ring-4 focus:ring-brand/20 dark:bg-shell dark:text-shell-muted"
          >
            <TopbarIcon type="send" />
          </button>
        )}

        <button
          type="button"
          aria-label="Mở thông báo"
          aria-haspopup="menu"
          aria-expanded={openMenu === "notifications"}
          onClick={() => setOpenMenu(openMenu === "notifications" ? null : "notifications")}
          className="relative mr-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-shell-border bg-surface text-muted shadow-sm transition hover:border-brand hover:bg-brand-soft hover:text-brand focus:outline-none focus:ring-4 focus:ring-brand/20 dark:bg-shell dark:text-shell-muted"
        >
          <TopbarIcon type="bell" />
          {displayUnreadCount > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-shell bg-danger" />}
        </button>

        {openMenu === "notifications" && (
          <NotificationMenu
            role={role}
            isLoading={notificationQuery.isLoading}
            groups={groupedNotifications}
            totalNotifications={totalNotifications}
            onSelect={(notification) => {
              setSelectedNotification(notification);
              setOpenMenu(null);
            }}
          />
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
          <Avatar src={profile?.avatar} alt={displayName} fallback={initials} size="topbar" />
          <span className="hidden min-w-0 sm:block">
            <span className="block text-sm font-bold leading-4 text-foreground dark:text-white">{displayName}</span>
            <span className="block text-xs font-medium text-shell-muted">{displayRole}</span>
          </span>
          <TopbarChevron open={openMenu === "profile"} />
        </button>

        {openMenu === "profile" && (
          <ProfileMenu
            role={role}
            displayName={displayName}
            displayEmail={displayEmail}
            displayRole={displayRole}
            avatar={profile?.avatar}
            initials={initials}
            onLogout={handleLogout}
          />
        )}
      </div>

      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          role={role}
          onClose={() => setSelectedNotification(null)}
        />
      )}
      {sendOpen && <SendNotificationModal onClose={() => setSendOpen(false)} />}
    </header>
  );
}
