"use client";

export function PriceListTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">Dịch vụ</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Giá</th>
            <th className="px-6 py-3 text-left text-sm font-medium">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-6 py-4">Chưa thiết lập giá</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
