import type { AdminEntity, AdminList } from "@/apis/admin/supported-api";

export type DashboardTopbarRole = "admin" | "provider";

export type TopbarNotificationList = AdminList & {
  unreadCount?: number;
};

export type GroupedNotification = {
  key: string;
  sample: AdminEntity;
  count: number;
};
