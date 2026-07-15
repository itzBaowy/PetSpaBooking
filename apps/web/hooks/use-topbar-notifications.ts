"use client";

import { useQuery } from "@tanstack/react-query";
import { listSchema, textValue, type AdminEntity } from "@/apis/admin/supported-api";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { useNotificationSocket } from "@/hooks/use-notification-socket";
import { useAuthStore } from "@/stores/auth-store";
import type { DashboardTopbarRole, GroupedNotification, TopbarNotificationList } from "@/components/layout/topbar/types";

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
  const accessToken = useAuthStore((state) => state.accessToken);
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
    enabled: Boolean(accessToken && userId),
  });

  useNotificationSocket({
    enabled: Boolean(accessToken && userId),
    role,
    userId,
  });

  const scopedNotificationItems = query.data?.items ?? [];
  const groupedNotifications = singleNotifications(scopedNotificationItems);
  const totalNotifications = scopedNotificationItems.length;
  const unreadCount =
    query.data?.unreadCount ??
    scopedNotificationItems.filter((item) => !item.readAt && item.isRead !== true).length;

  return {
    query,
    groupedNotifications,
    totalNotifications,
    unreadCount,
  };
}
