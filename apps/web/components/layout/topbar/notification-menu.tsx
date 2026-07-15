"use client";

import { useState } from "react";
import { textValue, type AdminEntity } from "@/apis/admin/supported-api";
import { formatNotificationTitle } from "./notification-labels";
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
  const [providerTab, setProviderTab] = useState<"chat" | "platform">("chat");
  const chatGroups = groups.filter(
    (group) => textValue(group.sample.type, "") === "CHAT_MESSAGE_NEW",
  );
  const platformGroups = groups.filter(
    (group) => textValue(group.sample.type, "") !== "CHAT_MESSAGE_NEW",
  );

  return (
    <div className="absolute right-3 top-12 z-[90] w-80 overflow-hidden rounded-xl border border-border-subtle bg-surface text-foreground shadow-xl">
      <div className="border-b border-border-subtle px-4 py-3">
        <p className="text-sm font-bold">Thông báo</p>
        <p className="text-xs text-muted">{role === "admin" ? `${totalNotifications} thông báo đã gom nhóm` : `${totalNotifications} thông báo của bạn`}</p>
      </div>
      <div className="max-h-80 overflow-y-auto p-1.5">
        {isLoading ? (
          <p className="p-4 text-sm text-muted">Đang tải thông báo...</p>
        ) : groups.length === 0 ? (
          <p className="p-4 text-sm text-muted">Chưa có thông báo.</p>
        ) : role === "provider" ? (
          <div>
            <div className="sticky top-0 z-10 mb-1 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              <NotificationTab
                active={providerTab === "chat"}
                count={chatGroups.length}
                icon="💬"
                label="Tin nhắn"
                onClick={() => setProviderTab("chat")}
              />
              <NotificationTab
                active={providerTab === "platform"}
                count={platformGroups.length}
                icon="🔔"
                label="Nền tảng"
                onClick={() => setProviderTab("platform")}
              />
            </div>
            {providerTab === "chat" ? (
              chatGroups.length > 0 ? (
                <NotificationItems groups={chatGroups} onSelect={onSelect} />
              ) : (
                <NotificationTabEmpty icon="💬" text="Chưa có tin nhắn mới." />
              )
            ) : platformGroups.length > 0 ? (
              <NotificationItems groups={platformGroups} onSelect={onSelect} />
            ) : (
              <NotificationTabEmpty icon="🔔" text="Chưa có thông báo nền tảng." />
            )}
          </div>
        ) : (
          <NotificationItems groups={groups} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}

function NotificationTab({
  active,
  count,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-extrabold transition ${
        active ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
      <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
        {count}
      </span>
    </button>
  );
}

function NotificationTabEmpty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="grid place-items-center px-4 py-8 text-center">
      <span className="text-3xl opacity-50" aria-hidden="true">{icon}</span>
      <p className="mt-2 text-xs font-medium text-muted">{text}</p>
    </div>
  );
}

function NotificationItems({
  groups,
  onSelect,
}: {
  groups: GroupedNotification[];
  onSelect: (notification: AdminEntity) => void;
}) {
  return (
    <>
      {groups.map((group) => (
        <button
          key={group.key}
          type="button"
          onClick={() => onSelect({ ...group.sample, recipientCount: group.count })}
          className="flex w-full gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-brand-soft"
        >
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">
              {formatNotificationTitle(group.sample.type, group.sample.title)}
            </span>
            <span className="mt-0.5 line-clamp-2 block text-xs text-muted">
              {textValue(group.sample.message, "Không có nội dung")}
              {group.count > 1 ? ` • ${group.count} người nhận` : ""}
            </span>
          </span>
        </button>
      ))}
    </>
  );
}
