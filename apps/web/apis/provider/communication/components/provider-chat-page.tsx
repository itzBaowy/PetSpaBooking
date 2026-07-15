"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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

export function ProviderChatPage({ requestedThreadId }: { requestedThreadId?: string }) {
  const threadsQuery = useProviderChatThreads({ page: 1, pageSize: 50 });
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>(requestedThreadId);
  const send = useSendProviderChatMessage();
  const markRead = useMarkProviderChatRead();
  const threads = useMemo(
    () => sortByDateDesc(threadsQuery.data?.items ?? [], (thread) => thread.lastMessageAt),
    [threadsQuery.data?.items],
  );
  const activeThreadId = selectedThreadId ?? requestedThreadId ?? threads[0]?.id;
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
  const messagesViewportRef = useRef<HTMLDivElement>(null);
  const latestMessage = messages[messages.length - 1];
  const latestMessageKey = latestMessage
    ? `${latestMessage.id}:${latestMessage.createdAt ?? latestMessage.createAt ?? ""}:${latestMessage.content ?? latestMessage.message ?? latestMessage.text ?? ""}`
    : "empty";
  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId),
    [activeThreadId, threads],
  );

  useEffect(() => {
    if (requestedThreadId) setSelectedThreadId(requestedThreadId);
  }, [requestedThreadId]);

  useEffect(() => {
    if (activeThreadId) markRead.mutate(activeThreadId);
    // Marking read is a side effect of opening the thread; dependency on mutate would retrigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadId]);

  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport || messagesQuery.isLoading) return;

    const frame = window.requestAnimationFrame(() => {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeThreadId, latestMessageKey, messagesQuery.isLoading]);

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
        <div className="grid h-full min-h-0 overflow-hidden rounded-2xl border border-emerald-100 bg-surface shadow-[0_12px_36px_rgba(5,150,105,0.10)] lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-b border-border-subtle lg:border-b-0 lg:border-r">
            <div className="shrink-0 border-b border-emerald-100 bg-white px-5 py-4">
              <h1 className="text-xl font-black tracking-tight text-slate-900">Tin nhắn</h1>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Trò chuyện với khách hàng</p>
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

            <div
              ref={messagesViewportRef}
              className="relative min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-emerald-50/70 via-white to-teal-50/50 p-4"
            >
              <PetChatBackdrop />
              {messagesQuery.isLoading ? (
                <ProviderLoading />
              ) : messagesQuery.isError ? (
                <ProviderError error={messagesQuery.error} retry={() => void messagesQuery.refetch()} />
              ) : (
                <div className="relative z-10 space-y-3">
                  {messages.map((message) => {
                    const isProvider = message.senderRole === "PROVIDER" || message.senderRole === "provider";
                    const senderName = getMessageSenderName(
                      message,
                      isProvider ? "Bạn" : selectedThread ? getCustomerName(selectedThread) : "Khách hàng",
                    );
                    return (
                      <div className={`flex ${isProvider ? "justify-end" : "justify-start"}`} key={message.id}>
                        <div
                          className={`max-w-[78%] rounded-2xl border px-4 py-3 shadow-sm ${
                            isProvider
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-200 bg-white text-slate-800"
                          }`}
                        >
                          <p className={`mb-1 text-xs font-bold ${isProvider ? "text-white" : "text-slate-700"}`}>
                            {senderName}
                          </p>
                          <p className="text-sm font-semibold leading-relaxed">{message.content ?? message.message ?? message.text ?? ""}</p>
                          <p className={`mt-1.5 text-[11px] ${isProvider ? "text-white/75" : "text-slate-500"}`}>
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
  const lastMessageRecord =
    typeof thread.lastMessage === "object" && thread.lastMessage !== null
      ? thread.lastMessage
      : thread.messages?.[0];
  const lastMessageText =
    (typeof thread.lastMessage === "string" ? thread.lastMessage : null) ??
    lastMessageRecord?.content ??
    lastMessageRecord?.message ??
    lastMessageRecord?.text ??
    "Chưa có tin nhắn";
  const sentByProvider =
    lastMessageRecord?.senderRole === "PROVIDER" || lastMessageRecord?.senderRole === "provider";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative block w-full border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${active ? "bg-emerald-50" : "bg-white"}`}
    >
      {active ? <span className="absolute inset-y-0 left-0 w-1 bg-emerald-500" /> : null}
      <div className="flex items-center gap-3">
        <Avatar src={avatar} alt={customerName} fallback={getAvatarInitials(customerName)} size="list" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <strong className={`truncate text-[15px] font-black ${active ? "text-emerald-800" : "text-slate-900"}`}>
              {customerName}
            </strong>
            <span className="shrink-0 text-[11px] text-muted">
              {chatListTime(
                thread.lastMessageAt ?? lastMessageRecord?.createdAt ?? lastMessageRecord?.createAt,
              )}
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
              <span className="truncate text-[11px] font-semibold text-emerald-700">{thread.booking.service.name}</span>
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
    <header className="border-b border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <Avatar src={avatar} alt={customerName} fallback={getAvatarInitials(customerName)} size="list" />
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black text-emerald-900">{customerName}</h2>
          <p className="mt-1 text-sm font-medium text-emerald-700">
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
    <form className="flex gap-2 border-t border-slate-200 bg-white p-4" onSubmit={submit}>
      <Input
        className="border-emerald-200 bg-white focus-visible:border-emerald-500 focus-visible:ring-emerald-200"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Nhập tin nhắn..."
      />
      <Button
        className="bg-emerald-600 px-6 font-bold text-white hover:bg-emerald-700"
        disabled={disabled || !content.trim()}
        type="submit"
      >
        Gửi
      </Button>
    </form>
  );
}

function PetChatBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span className="absolute left-[8%] top-[8%] rotate-[-18deg] text-4xl text-emerald-200/35">🐾</span>
      <span className="absolute right-[10%] top-[20%] rotate-12 text-3xl text-teal-200/30">🐾</span>
      <span className="absolute left-[22%] top-[43%] rotate-[22deg] text-2xl text-emerald-200/25">🐾</span>
      <span className="absolute right-[28%] top-[58%] rotate-[-12deg] text-4xl text-teal-200/25">🐾</span>
      <span className="absolute bottom-[10%] left-[12%] rotate-12 text-3xl text-emerald-200/30">🐾</span>
      <span className="absolute bottom-[6%] right-[8%] rotate-[-20deg] text-2xl text-teal-200/25">🐾</span>
    </div>
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
