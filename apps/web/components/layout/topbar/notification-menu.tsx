"use client";

import { textValue, type AdminEntity } from "@/apis/admin/supported-api";
import type { DashboardTopbarRole, GroupedNotification } from "./types";

export function NotificationMenu({
  role,
  isLoading,
  groups,
  totalNotifications,
  onSelect,
}: {
  role: DashboardTopbarRole;
  isLoading: boolean;
  groups: GroupedNotification[];
  totalNotifications: number;
  onSelect: (notification: AdminEntity) => void;
}) {
  return (
    <div className="absolute right-3 top-12 z-50 w-80 overflow-hidden rounded-xl border border-border-subtle bg-surface text-foreground shadow-xl">
      <div className="border-b border-border-subtle px-4 py-3">
        <p className="text-sm font-bold">Thông báo</p>
        <p className="text-xs text-muted">{role === "admin" ? `${totalNotifications} thông báo đã gom nhóm` : `${totalNotifications} thông báo của bạn`}</p>
      </div>
      <div className="max-h-80 overflow-y-auto p-1.5">
        {isLoading ? (
          <p className="p-4 text-sm text-muted">Đang tải thông báo...</p>
        ) : groups.length === 0 ? (
          <p className="p-4 text-sm text-muted">Chưa có thông báo.</p>
        ) : (
          groups.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => onSelect({ ...group.sample, recipientCount: group.count })}
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
  );
}
