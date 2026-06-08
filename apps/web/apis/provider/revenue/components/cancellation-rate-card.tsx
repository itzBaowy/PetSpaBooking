'use client';

export function CancellationRateCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 text-sm">Cancellation Rate</p>
      <p className="text-3xl font-bold">0%</p>
      <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
    </div>
  );
}
