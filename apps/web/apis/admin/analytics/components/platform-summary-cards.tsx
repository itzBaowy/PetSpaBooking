'use client';

export function PlatformSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 text-sm">Total Users</p>
        <p className="text-2xl font-bold">0</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 text-sm">Total Bookings</p>
        <p className="text-2xl font-bold">0</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 text-sm">Platform Revenue</p>
        <p className="text-2xl font-bold">$0.00</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 text-sm">Active Providers</p>
        <p className="text-2xl font-bold">0</p>
      </div>
    </div>
  );
}
