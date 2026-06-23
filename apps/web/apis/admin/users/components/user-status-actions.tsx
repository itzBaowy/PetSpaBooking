"use client";

export function UserStatusActions() {
  return (
    <div className="flex gap-2">
      <button className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600">
        Xem
      </button>
      <button className="bg-yellow-500 text-white px-3 py-1 text-sm rounded hover:bg-yellow-600">
        Sửa
      </button>
      <button className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600">
        Tạm khóa
      </button>
    </div>
  );
}
