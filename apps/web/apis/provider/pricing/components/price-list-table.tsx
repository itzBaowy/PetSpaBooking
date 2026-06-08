'use client';

export function PriceListTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">Service</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Price</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Duration</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-6 py-4">No prices set</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
