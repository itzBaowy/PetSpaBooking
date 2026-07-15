import { ProviderChatPage } from "@/apis/provider/communication/components/provider-chat-page";

export default async function ProviderChatRoute({
  searchParams,
}: {
  searchParams: Promise<{ threadId?: string }>;
}) {
  const { threadId } = await searchParams;

  return (
    <main className="h-[calc(100dvh-4rem)] min-h-0 p-2 sm:p-3">
      <div className="mx-auto h-full min-h-0 max-w-[1600px]">
        <ProviderChatPage requestedThreadId={threadId} />
      </div>
    </main>
  );
}
