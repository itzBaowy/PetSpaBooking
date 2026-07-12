"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/apis/auth/queries";
import { listSchema, textValue, type AdminEntity, type AdminList } from "@/apis/admin/supported-api";
import { displayValue, errorMessage } from "@/components/admin/shared";
import { Avatar, getAvatarInitials } from "@/components/ui/avatar";
import { CustomSelect } from "@/components/ui/custom-select";
import { ThemeMenuItem } from "@/components/ui/theme-menu-item";
import { useToast } from "@/components/ui";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { useNotificationSocket } from "@/hooks/use-notification-socket";
import { api } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse } from "@/types/api";

type DashboardTopbarRole = "admin" | "provider";

const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị viên",
  PROVIDER: "Nhà cung cấp dịch vụ",
  CUSTOMER: "Khách hàng",
};

const notificationTypeOptions = [
  { value: "ADMIN_ANNOUNCEMENT", label: "Thông báo quản trị" },
  { value: "SYSTEM_MAINTENANCE", label: "Bảo trì hệ thống" },
  { value: "POLICY_UPDATE", label: "Cập nhật chính sách" },
];

type GroupedNotification = {
  key: string;
  sample: AdminEntity;
  count: number;
};

type TopbarNotificationList = AdminList & {
  unreadCount?: number;
};

const notificationTypeLabels: Record<string, string> = {
  ADMIN_ANNOUNCEMENT: "Thông báo quản trị",
  SYSTEM_MAINTENANCE: "Bảo trì hệ thống",
  POLICY_UPDATE: "Cập nhật chính sách",
  DISPUTE_CREATED: "Khách hàng tạo tranh chấp",
  BOOKING_COMPLETED: "Lịch đặt hoàn tất",
  BOOKING_CREATED: "Lịch đặt mới",
  BOOKING_CANCELLED: "Lịch đặt đã hủy",
  BOOKING_CONFIRMED: "Lịch đặt đã xác nhận",
  PAYMENT_SUCCESS: "Thanh toán thành công",
  PAYMENT_FAILED: "Thanh toán thất bại",
  WITHDRAWAL_APPROVED: "Yêu cầu rút tiền đã duyệt",
  WITHDRAWAL_REJECTED: "Yêu cầu rút tiền bị từ chối",
  SERVICE_APPROVED: "Dịch vụ đã duyệt",
  SERVICE_REJECTED: "Dịch vụ bị từ chối",
};

const screenLabels: Record<string, string> = {
  dashboard: "Tổng quan",
  notifications: "Thông báo",
  bookings: "Lịch đặt",
  booking_detail: "Chi tiết lịch đặt",
  disputes: "Tranh chấp",
  dispute_detail: "Chi tiết tranh chấp",
  services: "Dịch vụ",
  service_detail: "Chi tiết dịch vụ",
  wallet: "Ví",
  withdrawals: "Rút tiền",
  profile: "Hồ sơ",
};

function titleCaseSnake(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatNotificationType(value: unknown) {
  const raw = textValue(value, "");
  if (!raw) return "Thông báo";
  return notificationTypeLabels[raw] ?? titleCaseSnake(raw);
}

function getNotificationData(notification: AdminEntity) {
  return notification.data && typeof notification.data === "object"
    ? (notification.data as Record<string, unknown>)
    : null;
}

function formatScreen(value: unknown) {
  const raw = textValue(value, "");
  if (!raw) return "Không có màn hình liên quan";
  return screenLabels[raw] ?? titleCaseSnake(raw);
}

function groupNotifications(items: AdminEntity[] = []): GroupedNotification[] {
  const map = new Map<string, GroupedNotification>();
  for (const item of items) {
    const key = [textValue(item.type), textValue(item.title), textValue(item.message)].join("::");
    const current = map.get(key);
    if (current) {
      current.count += 1;
    } else {
      map.set(key, { key, sample: item, count: 1 });
    }
  }
  return Array.from(map.values());
}

function singleNotifications(items: AdminEntity[] = []): GroupedNotification[] {
  return items.map((item, index) => ({
    key: textValue(item.id, `${index}`),
    sample: item,
    count: 1,
  }));
}

function Icon({ type }: { type: "bell" | "user" | "activity" | "logout" | "send" }) {
  const paths = {
    bell:
      "M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h11Zm0 0a3 3 0 1 1-6 0",
    user:
      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    activity: "M3 3v18h18M7 15l3-3 3 2 5-6",
    logout:
      "m10 17 5-5-5-5m5 5H3m11-9h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5",
    send: "M22 2 11 13m11-11-7 20-4-9-9-4 20-7Z",
  };

  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[type]} />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={cn("h-4 w-4 transition-transform", open && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
    </svg>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-20">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-surface text-foreground shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-surface-muted hover:text-foreground">
            ×
          </button>
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function NotificationDetailModal({
  notification,
  role,
  onClose,
}: {
  notification: AdminEntity;
  role: DashboardTopbarRole;
  onClose: () => void;
}) {
  const user = notification.user && typeof notification.user === "object" ? (notification.user as Record<string, unknown>) : null;
  const recipientCount = typeof notification.recipientCount === "number" ? notification.recipientCount : 1;
  const data = getNotificationData(notification);
  const screen = data?.screen;

  return (
    <Modal title="Chi tiết thông báo" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">{formatNotificationType(notification.type)}</p>
          <h3 className="mt-1 text-xl font-extrabold">{textValue(notification.title, "Không có tiêu đề")}</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{textValue(notification.message, "Không có nội dung")}</p>
        </div>

        {role === "admin" ? (
          <div className="grid gap-3 rounded-2xl bg-surface-muted p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Người nhận</p>
              <p className="mt-1 font-bold">{textValue(user?.fullName ?? user?.userName)}</p>
              <p className="text-xs text-muted">{textValue(user?.email)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Số người nhận</p>
              <p className="mt-1 font-bold">{recipientCount}</p>
              <p className="text-xs text-muted">{displayValue(notification.createAt, "createAt")}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 rounded-2xl bg-surface-muted p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Loại thông báo</p>
              <p className="mt-1 font-bold">{formatNotificationType(notification.type)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Thời gian</p>
              <p className="mt-1 font-bold">{displayValue(notification.createAt, "createAt")}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase text-muted">Màn hình liên quan</p>
              <p className="mt-1 font-bold">{formatScreen(screen)}</p>
            </div>
          </div>
        )}

        {role === "admin" && screen ? (
          <div className="rounded-2xl bg-surface-muted p-4 text-sm">
            <p className="text-xs font-semibold uppercase text-muted">Màn hình liên quan</p>
            <p className="mt-1 font-bold">{formatScreen(screen)}</p>
          </div>
        ) : null}

      </div>
    </Modal>
  );
}

function SendNotificationModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"single" | "broadcast">("single");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("PROVIDER");
  const [type, setType] = useState("ADMIN_ANNOUNCEMENT");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { type: type.trim(), title: title.trim(), message: message.trim() };
      const url = mode === "single" ? API_ENDPOINTS.ADMIN.NOTIFICATIONS.SEND : API_ENDPOINTS.ADMIN.NOTIFICATIONS.BROADCAST;
      const body = mode === "single" ? { ...payload, userId: userId.trim() } : { ...payload, role };
      return (await api.post<ApiResponse<unknown>>(url, body)).data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["topbar-notifications"] });
      showToast("Đã gửi thông báo.", "success");
      onClose();
    },
    onError: (error) => showToast(errorMessage(error), "error"),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!type.trim() || !title.trim() || !message.trim()) {
      showToast("Vui lòng nhập đủ loại, tiêu đề và nội dung.", "error");
      return;
    }
    if (mode === "single" && !userId.trim()) {
      showToast("Vui lòng nhập mã người nhận.", "error");
      return;
    }
    mutation.mutate();
  };

  return (
    <Modal title="Gửi thông báo" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="rounded-xl bg-surface-muted px-3 py-2 text-xs font-medium text-muted">
          Gửi cá nhân tạo 1 thông báo. Gửi theo nhóm sẽ tạo thông báo cho từng người dùng đang hoạt động trong vai trò đã chọn.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-muted">Gửi cho</span>
            <CustomSelect
              value={mode}
              onValueChange={(value) => setMode(value as "single" | "broadcast")}
              options={[
                { value: "single", label: "Một người dùng" },
                { value: "broadcast", label: "Nhóm theo vai trò" },
              ]}
            />
          </label>

          {mode === "single" ? (
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">Mã người nhận</span>
              <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Nhập userId" className="h-11 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm" />
            </label>
          ) : (
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">Vai trò nhận</span>
              <CustomSelect
                value={role}
                onValueChange={setRole}
                options={[
                  { value: "CUSTOMER", label: "Khách hàng" },
                  { value: "PROVIDER", label: "Nhà cung cấp" },
                  { value: "ADMIN", label: "Quản trị viên" },
                ]}
              />
            </label>
          )}
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Loại thông báo</span>
          <CustomSelect value={type} onValueChange={setType} options={notificationTypeOptions} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Tiêu đề</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nhập tiêu đề thông báo" className="h-11 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Nội dung</span>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Nhập nội dung thông báo" rows={4} className="w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm" />
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-border-muted px-4 text-sm font-bold">
            Hủy
          </button>
          <button type="submit" disabled={mutation.isPending} className="h-10 rounded-xl bg-brand px-4 text-sm font-bold text-white hover:bg-brand-hover disabled:opacity-60">
            {mutation.isPending ? "Đang gửi..." : "Gửi thông báo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function DashboardTopbar({ role }: { role: DashboardTopbarRole }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<"notifications" | "profile" | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<AdminEntity | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const { data: profile } = useProfile();
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const notificationEndpoint =
    role === "admin"
      ? API_ENDPOINTS.ADMIN.NOTIFICATIONS.LIST
      : API_ENDPOINTS.MOBILE.NOTIFICATIONS.LIST;

  const notificationQuery = useQuery({
    queryKey: ["topbar-notifications", role],
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(notificationEndpoint, {
        params: { page: 1, pageSize: 50 },
      });
      const parsed = listSchema.parse(response.data.data) as TopbarNotificationList;
      const rawData =
        response.data.data && typeof response.data.data === "object"
          ? (response.data.data as Record<string, unknown>)
          : {};
      return {
        ...parsed,
        unreadCount: typeof rawData.unreadCount === "number" ? rawData.unreadCount : undefined,
      };
    },
  });

  useNotificationSocket({
    enabled: Boolean(profile?.id),
    role,
    userId: profile?.id,
  });

  const notificationItems = notificationQuery.data?.items ?? [];
  const scopedNotificationItems =
    role === "provider"
      ? profile?.id
        ? notificationItems.filter((item) => textValue(item.userId, "") === profile.id)
        : []
      : notificationItems;
  const groupedNotifications =
    role === "admin"
      ? groupNotifications(scopedNotificationItems)
      : singleNotifications(scopedNotificationItems);
  const totalNotifications =
    role === "admin"
      ? groupedNotifications.length
      : scopedNotificationItems.length;
  const unreadCount =
    role === "admin"
      ? totalNotifications
      : scopedNotificationItems.filter((item) => !item.readAt).length;
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
          <button type="button" aria-label="Gửi thông báo" onClick={() => setSendOpen(true)} className="mr-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-shell-border bg-surface text-muted shadow-sm transition hover:border-brand hover:bg-brand-soft hover:text-brand focus:outline-none focus:ring-4 focus:ring-brand/20 dark:bg-shell dark:text-shell-muted">
            <Icon type="send" />
          </button>
        )}

        <button type="button" aria-label="Mở thông báo" aria-haspopup="menu" aria-expanded={openMenu === "notifications"} onClick={() => setOpenMenu(openMenu === "notifications" ? null : "notifications")} className="relative mr-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-shell-border bg-surface text-muted shadow-sm transition hover:border-brand hover:bg-brand-soft hover:text-brand focus:outline-none focus:ring-4 focus:ring-brand/20 dark:bg-shell dark:text-shell-muted">
          <Icon type="bell" />
          {unreadCount > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-shell bg-danger" />}
        </button>

        {openMenu === "notifications" && (
          <div className="absolute right-3 top-12 z-50 w-80 overflow-hidden rounded-xl border border-border-subtle bg-surface text-foreground shadow-xl">
            <div className="border-b border-border-subtle px-4 py-3">
              <p className="text-sm font-bold">Thông báo</p>
              <p className="text-xs text-muted">{role === "admin" ? `${totalNotifications} thông báo đã gom nhóm` : `${totalNotifications} thông báo của bạn`}</p>
            </div>
            <div className="max-h-80 overflow-y-auto p-1.5">
              {notificationQuery.isLoading ? (
                <p className="p-4 text-sm text-muted">Đang tải thông báo...</p>
              ) : groupedNotifications.length === 0 ? (
                <p className="p-4 text-sm text-muted">Chưa có thông báo.</p>
              ) : (
                groupedNotifications.map((group) => (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => {
                      setSelectedNotification({ ...group.sample, recipientCount: group.count });
                      setOpenMenu(null);
                    }}
                    className="flex w-full gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-brand-soft"
                  >
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">{textValue(group.sample.title, "Không có tiêu đề")}</span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-muted">
                        {textValue(group.sample.message, "Không có nội dung")}
                        {group.count > 1 ? ` • ${group.count} người nhận` : ""}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button type="button" aria-label="Mở menu hồ sơ" aria-haspopup="menu" aria-expanded={openMenu === "profile"} onBlur={() => closeSoon("profile")} onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")} className="inline-flex h-10 items-center gap-3 rounded-xl border border-shell-border bg-surface py-1 pl-1 pr-3 text-left text-muted shadow-sm transition hover:border-brand hover:bg-brand-soft hover:text-brand focus:outline-none focus:ring-4 focus:ring-brand/20 dark:bg-shell dark:text-shell-muted">
          <Avatar src={profile?.avatar} alt={displayName} fallback={initials} size="topbar" />
          <span className="hidden min-w-0 sm:block">
            <span className="block text-sm font-bold leading-4 text-foreground dark:text-white">{displayName}</span>
            <span className="block text-xs font-medium text-shell-muted">{displayRole}</span>
          </span>
          <Chevron open={openMenu === "profile"} />
        </button>

        {openMenu === "profile" && (
          <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-xl border border-border-subtle bg-surface text-foreground shadow-xl">
            <div className="border-b border-border-subtle p-4">
              <div className="flex items-center gap-3">
                <Avatar src={profile?.avatar} alt={displayName} fallback={initials} size="list" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{displayName}</p>
                  <p className="truncate text-xs text-muted">{displayEmail}</p>
                  <p className="mt-1 text-xs font-semibold text-brand">{displayRole}</p>
                </div>
              </div>
            </div>
            <div className="space-y-0.5 p-1.5">
              <Link href={`/${role}/profile`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-brand-soft hover:text-brand">
                <Icon type="user" /> Hồ sơ
              </Link>
              <button type="button" onMouseDown={(event) => event.preventDefault()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground transition hover:bg-brand-soft hover:text-brand">
                <Icon type="activity" /> Nhật ký hoạt động
              </button>
              <ThemeMenuItem />
              <div className="my-1 border-t border-border-subtle" />
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-danger transition hover:bg-danger-soft">
                <Icon type="logout" /> Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedNotification && <NotificationDetailModal notification={selectedNotification} role={role} onClose={() => setSelectedNotification(null)} />}
      {sendOpen && <SendNotificationModal onClose={() => setSendOpen(false)} />}
    </header>
  );
}
