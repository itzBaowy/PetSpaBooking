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
  ProviderPageHeader,
  providerDate,
  providerErrorText,
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
  const threads = useMemo(() => threadsQuery.data?.items ?? [], [threadsQuery.data?.items]);
  const activeThreadId = selectedThreadId ?? threads[0]?.id;
  const { typingThreadId } = useProviderChatSocket(activeThreadId);
  const messagesQuery = useProviderChatMessages(activeThreadId);
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
    <div className="space-y-5">
      <ProviderPageHeader title="Tin nhắn" description="Trao đổi với khách hàng qua Mobile Chat API và Socket.IO realtime." />
      {threads.length === 0 ? (
        <ProviderEmpty text="Chưa có cuộc trò chuyện." />
      ) : (
        <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="border-b border-border-subtle lg:border-b-0 lg:border-r">
            {threads.map((thread) => (
              <ThreadButton
                key={thread.id}
                active={activeThreadId === thread.id}
                isTyping={typingThreadId === thread.id}
                thread={thread}
                onClick={() => setSelectedThreadId(thread.id)}
              />
            ))}
          </aside>

          <section className="flex min-h-[620px] flex-col">
            <ChatHeader thread={selectedThread} isTyping={typingThreadId === activeThreadId} />

            <div className="flex-1 overflow-y-auto p-4">
              {messagesQuery.isLoading ? (
                <ProviderLoading />
              ) : messagesQuery.isError ? (
                <ProviderError error={messagesQuery.error} retry={() => void messagesQuery.refetch()} />
              ) : (
                <div className="space-y-3">
                  {(messagesQuery.data?.items ?? []).map((message) => {
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

  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full border-b border-border-subtle p-4 text-left hover:bg-surface-muted ${active ? "bg-brand-soft" : ""}`}
    >
      <div className="flex gap-3">
        <Avatar src={avatar} alt={customerName} fallback={getAvatarInitials(customerName)} size="list" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <strong className="truncate">{customerName}</strong>
            {thread.unreadCount ? (
              <span className="shrink-0 rounded-full bg-danger px-2 py-0.5 text-xs font-bold text-white">{thread.unreadCount}</span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-sm text-muted">
            {isTyping
              ? "Khách đang nhập..."
              : thread.lastMessage?.content ?? thread.lastMessage?.message ?? thread.lastMessage?.text ?? "Chưa có tin nhắn"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <ProviderBadge value={thread.booking?.status ?? "Booking"} />
            <span className="text-xs text-muted">{providerDate(thread.lastMessageAt)}</span>
          </div>
        </div>
      </div>
    </button>
  );
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
