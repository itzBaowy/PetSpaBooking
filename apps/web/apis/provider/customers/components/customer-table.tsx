"use client";

export function CustomerTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Phone</th>
            <th className="px-6 py-3 text-left text-sm font-medium">
              Total Bookings
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-6 py-4">No customers yet</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
