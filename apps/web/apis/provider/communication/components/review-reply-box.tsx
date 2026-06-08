'use client';

export function ReviewReplyBox() {
  return (
    <form className="bg-white p-6 rounded-lg shadow space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Reply to Review</label>
        <textarea className="w-full border rounded px-3 py-2 h-20" placeholder="Write your reply"></textarea>
      </div>
      <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
        Post Reply
      </button>
    </form>
  );
}
