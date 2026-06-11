import { ChatWindow } from "@/apis/provider/communication/components/chat-window";

export default function Chat() {
  return (
    <div className="p-6 h-full">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <ChatWindow />
    </div>
  );
}
