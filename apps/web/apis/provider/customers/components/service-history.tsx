'use client';

export function ServiceHistory() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">Service History</h3>
      <div className="space-y-3">
        <div className="border rounded p-3">
          <p className="text-gray-500 text-center">No service history</p>
        </div>
      </div>
    </div>
  );
}
