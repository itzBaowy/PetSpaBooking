"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { listSchema, textValue, type AdminEntity, type AdminList } from "@/apis/admin/supported-api";
import { useToast } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";

type NotificationSocketPayload = {
  notification?: AdminEntity | null;
  shouldRefetch?: boolean;
};

function getSocketUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "";
  return apiUrl.replace(/\/api\/?$/, "");
}

function notificationBelongsToUser(notification: AdminEntity, userId?: string) {
  if (!userId) return false;
  return textValue(notification.userId, "") === userId;
}

function upsertNotification(list: AdminList, notification: AdminEntity): AdminList {
  const existingIndex = list.items.findIndex((item) => item.id && item.id === notification.id);
  const items =
    existingIndex >= 0
      ? list.items.map((item, index) => (index === existingIndex ? { ...item, ...notification } : item))
      : [notification, ...list.items];

  return {
    ...list,
    items,
    pagination: {
      ...list.pagination,
      totalItems:
        existingIndex >= 0 ? list.pagination.totalItems : list.pagination.totalItems + 1,
    },
  };
}

export function useNotificationSocket({
  enabled,
  role,
  userId,
}: {
  enabled: boolean;
  role: "admin" | "provider";
  userId?: string;
}) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!enabled || !accessToken) return;

    const socketUrl = getSocketUrl();
    if (!socketUrl) return;

    const socket: Socket = io(socketUrl, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
    });

    const queryKey = ["topbar-notifications", role];

    socket.on("socket:connected", () => {
      void queryClient.invalidateQueries({ queryKey });
    });

    socket.on("notification:new", (payload: NotificationSocketPayload) => {
      const notification = payload?.notification;

      if (payload?.shouldRefetch || !notification?.id) {
        void queryClient.invalidateQueries({ queryKey });
      }

      if (notification?.id && notificationBelongsToUser(notification, userId)) {
        queryClient.setQueryData(queryKey, (current: unknown) => {
          const parsed = listSchema.parse(current) as AdminList;
          return upsertNotification(parsed, notification);
        });
      }

      if (notification && notificationBelongsToUser(notification, userId)) {
        showToast(
          textValue(notification.message, textValue(notification.title, "Bạn có thông báo mới.")),
          "info",
        );
      }
    });

    socket.on("connect_error", () => {
      void queryClient.invalidateQueries({ queryKey });
    });

    socket.on("disconnect", () => {
      void queryClient.invalidateQueries({ queryKey });
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, enabled, queryClient, role, showToast, userId]);
}
