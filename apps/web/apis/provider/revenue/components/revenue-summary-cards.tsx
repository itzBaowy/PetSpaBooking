'use client';

export function RevenueSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 text-sm">Total Revenue</p>
        <p className="text-2xl font-bold">$0.00</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 text-sm">This Month</p>
        <p className="text-2xl font-bold">$0.00</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 text-sm">Pending</p>
        <p className="text-2xl font-bold">$0.00</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 text-sm">Completed Bookings</p>
        <p className="text-2xl font-bold">0</p>
      </div>
    </div>
  );
}
