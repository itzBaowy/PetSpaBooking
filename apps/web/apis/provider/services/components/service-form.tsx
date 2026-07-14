"use client";

export function ServiceForm() {
  return (
    <form className="bg-white p-6 rounded-lg shadow space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tên dịch vụ</label>
        <input type="text" className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Mô tả</label>
        <textarea className="w-full border rounded px-3 py-2 h-24"></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Giá dịch vụ</label>
        <input type="number" className="w-full border rounded px-3 py-2" />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Lưu dịch vụ
      </button>
    </form>
  );
}
