"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth-store";
import type {
  ProviderChatMessageApi,
  ProviderChatThreadApi,
  ProviderPage,
} from "@/types/provider-api";
import { communicationKeys } from "./queries";

type ChatMessagePayload = {
  threadId?: string;
  bookingId?: string;
  message?: ProviderChatMessageApi | null;
};

type ChatReadPayload = {
  threadId?: string;
  readerId?: string;
  readAt?: string;
  count?: number;
};

type ChatTypingPayload = {
  threadId?: string;
  userId?: string;
  isTyping?: boolean;
};

function getSocketUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "";
  return apiUrl.replace(/\/api\/?$/, "");
}

function messageTime(message: ProviderChatMessageApi) {
  return message.createdAt ?? message.createAt ?? new Date().toISOString();
}

function upsertMessage(
  page: ProviderPage<ProviderChatMessageApi> | undefined,
  message: ProviderChatMessageApi,
): ProviderPage<ProviderChatMessageApi> | undefined {
  if (!page) return page;
  const existingIndex = page.items.findIndex((item) => item.id === message.id);
  const items =
    existingIndex >= 0
      ? page.items.map((item, index) => (index === existingIndex ? { ...item, ...message } : item))
      : [...page.items, message];

  return {
    ...page,
    items,
    pagination: {
      ...page.pagination,
      totalItems: existingIndex >= 0 ? page.pagination.totalItems : page.pagination.totalItems + 1,
    },
  };
}

function updateThreadWithMessage(
  page: ProviderPage<ProviderChatThreadApi> | undefined,
  threadId: string,
  message: ProviderChatMessageApi,
  activeThreadId?: string,
): ProviderPage<ProviderChatThreadApi> | undefined {
  if (!page) return page;
  const index = page.items.findIndex((thread) => thread.id === threadId);
  if (index < 0) return page;

  const nextThread = {
    ...page.items[index],
    lastMessage: message,
    lastMessageAt: messageTime(message),
    unreadCount: activeThreadId === threadId ? 0 : (page.items[index].unreadCount ?? 0) + 1,
  };
  const items = [nextThread, ...page.items.filter((thread) => thread.id !== threadId)];
  return { ...page, items };
}

export function useProviderChatSocket(activeThreadId?: string) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [typingThreadId, setTypingThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socketUrl = getSocketUrl();
    if (!socketUrl) return;

    const socket: Socket = io(socketUrl, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      if (activeThreadId) socket.emit("chat:join", { threadId: activeThreadId });
    });

    socket.on("socket:connected", () => {
      if (activeThreadId) socket.emit("chat:join", { threadId: activeThreadId });
    });

    socket.on("chat:message:new", (payload: ChatMessagePayload) => {
      const threadId = payload?.threadId ?? payload?.message?.threadId;
      const message = payload?.message;
      if (!threadId || !message?.id) {
        void queryClient.invalidateQueries({ queryKey: communicationKeys.all });
        return;
      }

      queryClient.setQueriesData<ProviderPage<ProviderChatMessageApi>>(
        { queryKey: [...communicationKeys.all, "messages", threadId] },
        (current) => upsertMessage(current, { ...message, threadId }),
      );
      queryClient.setQueriesData<ProviderPage<ProviderChatThreadApi>>(
        { queryKey: [...communicationKeys.all, "threads"] },
        (current) => updateThreadWithMessage(current, threadId, { ...message, threadId }, activeThreadId),
      );
      void queryClient.invalidateQueries({ queryKey: [...communicationKeys.all, "threads"] });
    });

    socket.on("chat:read", (payload: ChatReadPayload) => {
      if (!payload?.threadId) return;
      void queryClient.invalidateQueries({
        queryKey: [...communicationKeys.all, "messages", payload.threadId],
      });
      void queryClient.invalidateQueries({ queryKey: [...communicationKeys.all, "threads"] });
    });

    socket.on("chat:typing", (payload: ChatTypingPayload) => {
      if (!payload?.threadId) return;
      setTypingThreadId(payload.isTyping ? payload.threadId : null);
    });

    socket.on("connect_error", () => {
      void queryClient.invalidateQueries({ queryKey: communicationKeys.all });
    });

    return () => {
      if (activeThreadId) socket.emit("chat:leave", { threadId: activeThreadId });
      socket.disconnect();
    };
  }, [accessToken, activeThreadId, queryClient]);

  return {
    typingThreadId,
  };
}
