"use client";

export function ChatWindow() {
  return (
    <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-center text-gray-500">Chưa có tin nhắn</p>
      </div>
      <div className="border-t p-4">
        <form className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
