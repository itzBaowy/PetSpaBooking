"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Avatar, getAvatarInitials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ProviderBadge,
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  providerDate,
  providerErrorText,
  sortByDateDesc,
} from "@/apis/provider/_shared/provider-ui";
import type { ProviderChatMessageApi, ProviderChatThreadApi } from "@/types/provider-api";
import {
  useMarkProviderChatRead,
  useProviderChatMessages,
  useProviderChatThreads,
  useSendProviderChatMessage,
} from "../queries";
import { useProviderChatSocket } from "../use-provider-chat-socket";

export function ProviderChatPage() {
  const threadsQuery = useProviderChatThreads({ page: 1, pageSize: 50 });
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();
  const send = useSendProviderChatMessage();
  const markRead = useMarkProviderChatRead();
  const threads = useMemo(
    () => sortByDateDesc(threadsQuery.data?.items ?? [], (thread) => thread.lastMessageAt),
    [threadsQuery.data?.items],
  );
  const activeThreadId = selectedThreadId ?? threads[0]?.id;
  const { typingThreadId } = useProviderChatSocket(activeThreadId);
  const messagesQuery = useProviderChatMessages(activeThreadId);
  const messages = useMemo(
    () =>
      [...(messagesQuery.data?.items ?? [])].sort((left, right) => {
        const leftTime = new Date(left.createdAt ?? left.createAt ?? 0).getTime();
        const rightTime = new Date(right.createdAt ?? right.createAt ?? 0).getTime();
        return leftTime - rightTime;
      }),
    [messagesQuery.data?.items],
  );
  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId),
    [activeThreadId, threads],
  );

  useEffect(() => {
    if (activeThreadId) markRead.mutate(activeThreadId);
    // Marking read is a side effect of opening the thread; dependency on mutate would retrigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadId]);

  if (threadsQuery.isLoading) return <ProviderLoading />;
  if (threadsQuery.isError) {
    return <ProviderError error={threadsQuery.error} retry={() => void threadsQuery.refetch()} />;
  }

  return (
    <div className="h-full min-h-0">
      {threads.length === 0 ? (
        <div className="grid h-full place-items-center">
          <ProviderEmpty text="Chưa có cuộc trò chuyện." />
        </div>
      ) : (
        <div className="grid h-full min-h-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-b border-border-subtle lg:border-b-0 lg:border-r">
            <div className="shrink-0 border-b border-border-subtle px-4 py-3">
              <h1 className="text-xl font-black text-foreground">Tin nhắn</h1>
              <p className="mt-0.5 text-xs text-muted">Trò chuyện với khách hàng</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {threads.map((thread) => (
                <ThreadButton
                  key={thread.id}
                  active={activeThreadId === thread.id}
                  isTyping={typingThreadId === thread.id}
                  thread={thread}
                  onClick={() => setSelectedThreadId(thread.id)}
                />
              ))}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden">
            <ChatHeader thread={selectedThread} isTyping={typingThreadId === activeThreadId} />

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {messagesQuery.isLoading ? (
                <ProviderLoading />
              ) : messagesQuery.isError ? (
                <ProviderError error={messagesQuery.error} retry={() => void messagesQuery.refetch()} />
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isProvider = message.senderRole === "PROVIDER" || message.senderRole === "provider";
                    const senderName = getMessageSenderName(
                      message,
                      isProvider ? "Bạn" : selectedThread ? getCustomerName(selectedThread) : "Khách hàng",
                    );
                    return (
                      <div className={`flex ${isProvider ? "justify-end" : "justify-start"}`} key={message.id}>
                        <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${isProvider ? "bg-brand text-white" : "bg-surface-muted"}`}>
                          <p className={`mb-1 text-xs font-extrabold ${isProvider ? "text-white/80" : "text-brand"}`}>
                            {senderName}
                          </p>
                          <p className="text-sm font-semibold">{message.content ?? message.message ?? message.text ?? ""}</p>
                          <p className={`mt-1 text-[11px] ${isProvider ? "text-white/70" : "text-muted"}`}>
                            {providerDate(message.createdAt ?? message.createAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <ChatComposer
              disabled={!activeThreadId || send.isLoading}
              onSubmit={(content) =>
                activeThreadId &&
                send.mutate(
                  { threadId: activeThreadId, content },
                  { onError: (error) => window.alert(providerErrorText(error)) },
                )
              }
            />
          </section>
        </div>
      )}
    </div>
  );
}

function ThreadButton({
  thread,
  active,
  isTyping,
  onClick,
}: {
  thread: ProviderChatThreadApi;
  active: boolean;
  isTyping: boolean;
  onClick: () => void;
}) {
  const customerName = getCustomerName(thread);
  const avatar = getCustomerAvatar(thread);
  const lastMessage = thread.lastMessage ?? thread.messages?.[0];
  const lastMessageText =
    lastMessage?.content ?? lastMessage?.message ?? lastMessage?.text ?? "Chưa có tin nhắn";
  const sentByProvider =
    lastMessage?.senderRole === "PROVIDER" || lastMessage?.senderRole === "provider";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative block w-full border-b border-border-subtle px-4 py-3 text-left transition-colors hover:bg-surface-muted ${active ? "bg-brand-soft" : ""}`}
    >
      {active ? <span className="absolute inset-y-0 left-0 w-1 bg-brand" /> : null}
      <div className="flex items-center gap-3">
        <Avatar src={avatar} alt={customerName} fallback={getAvatarInitials(customerName)} size="list" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <strong className="truncate text-[15px]">{customerName}</strong>
            <span className="shrink-0 text-[11px] text-muted">
              {chatListTime(thread.lastMessageAt ?? lastMessage?.createdAt ?? lastMessage?.createAt)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <p className={`min-w-0 flex-1 truncate text-sm ${thread.unreadCount ? "font-bold text-foreground" : "text-muted"}`}>
              {isTyping ? (
                <span className="font-semibold text-brand">Khách đang nhập...</span>
              ) : (
                <>{sentByProvider ? "Bạn: " : ""}{lastMessageText}</>
              )}
            </p>
            {thread.unreadCount ? (
              <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {thread.unreadCount}
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <ProviderBadge value={thread.booking?.status ?? "Booking"} />
            {thread.booking?.service?.name ? (
              <span className="truncate text-[11px] text-muted">{thread.booking.service.name}</span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}

function chatListTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function ChatHeader({
  thread,
  isTyping,
}: {
  thread?: ProviderChatThreadApi;
  isTyping: boolean;
}) {
  const customerName = thread ? getCustomerName(thread) : "Cuộc trò chuyện";
  const avatar = thread ? getCustomerAvatar(thread) : null;

  return (
    <header className="border-b border-border-subtle p-4">
      <div className="flex items-center gap-3">
        <Avatar src={avatar} alt={customerName} fallback={getAvatarInitials(customerName)} size="list" />
        <div className="min-w-0">
          <h2 className="truncate font-extrabold">{customerName}</h2>
          <p className="mt-1 text-sm text-muted">
            {thread?.booking?.service?.name ?? "Dịch vụ"} · {thread?.booking?.pet?.name ?? "Thú cưng"}
          </p>
        </div>
      </div>
      {isTyping ? <p className="mt-2 text-xs font-bold text-brand">Khách đang nhập...</p> : null}
    </header>
  );
}

function ChatComposer({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (content: string) => void;
}) {
  const [content, setContent] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = content.trim();
    if (!value) return;
    onSubmit(value);
    setContent("");
  };

  return (
    <form className="flex gap-2 border-t border-border-subtle p-4" onSubmit={submit}>
      <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Nhập tin nhắn..." />
      <Button disabled={disabled || !content.trim()} type="submit">
        Gửi
      </Button>
    </form>
  );
}

function getCustomerName(thread: ProviderChatThreadApi) {
  return (
    thread.customer?.fullName ??
    thread.customer?.users?.fullName ??
    thread.customer?.user?.fullName ??
    thread.customer?.name ??
    thread.customer?.users?.name ??
    thread.customer?.user?.name ??
    "Khách hàng"
  );
}

function getCustomerAvatar(thread: ProviderChatThreadApi) {
  return (
    thread.customer?.avatarUrl ??
    thread.customer?.users?.avatarUrl ??
    thread.customer?.user?.avatarUrl ??
    thread.customer?.avatar ??
    thread.customer?.users?.avatar ??
    thread.customer?.user?.avatar ??
    null
  );
}

function getMessageSenderName(message: ProviderChatMessageApi, fallback: string) {
  return (
    message.senderFullName ??
    message.sender?.fullName ??
    message.user?.fullName ??
    message.senderName ??
    message.sender?.name ??
    message.user?.name ??
    fallback
  );
}
