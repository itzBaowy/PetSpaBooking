"use client";

export function ServiceActionMenu() {
  return (
    <div className="flex gap-2">
      <button className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600">
        Chỉnh sửa
      </button>
      <button className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600">
        Xóa
      </button>
    </div>
  );
}
