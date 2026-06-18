"use client";

export function DisputeTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">
              Dispute ID
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium">Booking</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-6 py-4">No disputes found</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
