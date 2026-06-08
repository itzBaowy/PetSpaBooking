'use client';

export function SystemBookingTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">Booking ID</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Provider</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Customer</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Amount</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-6 py-4">No bookings found</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
