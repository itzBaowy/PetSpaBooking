"use client";

import { useQuery } from "@tanstack/react-query";
import { listSchema, textValue, type AdminEntity } from "@/apis/admin/supported-api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { useNotificationSocket } from "@/hooks/use-notification-socket";
import type { DashboardTopbarRole, GroupedNotification, TopbarNotificationList } from "@/components/layout/topbar/types";

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

export function useTopbarNotifications({
  role,
  userId,
}: {
  role: DashboardTopbarRole;
  userId?: string;
}) {
  const notificationEndpoint =
    role === "admin"
      ? API_ENDPOINTS.ADMIN.NOTIFICATIONS.LIST
      : API_ENDPOINTS.MOBILE.NOTIFICATIONS.LIST;

  const query = useQuery({
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
    enabled: Boolean(userId),
    role,
    userId,
  });

  const notificationItems = query.data?.items ?? [];
  const scopedNotificationItems =
    role === "provider"
      ? userId
        ? notificationItems.filter((item) => textValue(item.userId, "") === userId)
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

  return {
    query,
    groupedNotifications,
    totalNotifications,
    unreadCount,
  };
}
