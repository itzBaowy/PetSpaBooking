"use client";

import { textValue, type AdminEntity } from "@/apis/admin/supported-api";
import { displayValue } from "@/components/admin/shared";
import { Dialog } from "@/components/ui/dialog";
import { formatNotificationType, formatScreen } from "./notification-labels";
import type { DashboardTopbarRole } from "./types";

function getNotificationData(notification: AdminEntity) {
  return notification.data && typeof notification.data === "object"
    ? (notification.data as Record<string, unknown>)
    : null;
}

export function NotificationDetailModal({
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
    <Dialog title="Chi tiết thông báo" onClose={onClose}>
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
    </Dialog>
  );
}
