"use client";

export function BookingDetail() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Thông tin lịch đặt</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Mã lịch đặt</p>
            <p className="font-medium">Đang tải...</p>
          </div>
          <div>
            <p className="text-gray-600">Trạng thái</p>
            <p className="font-medium">Đang tải...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
