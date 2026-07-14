"use client";

export function BookingTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">
              Mã lịch đặt
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium">
              Khách hàng
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium">Ngày đặt</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-6 py-4">Chưa có lịch đặt</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
