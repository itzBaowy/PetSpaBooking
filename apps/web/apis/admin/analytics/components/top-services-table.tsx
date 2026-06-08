'use client';

export function TopServicesTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h3 className="font-semibold p-6 pb-0">Top Services</h3>
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">Service</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Bookings</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-6 py-4">No data</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
