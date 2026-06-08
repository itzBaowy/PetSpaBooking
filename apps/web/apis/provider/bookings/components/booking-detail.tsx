'use client';

export function BookingDetail() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Booking Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Booking ID</p>
            <p className="font-medium">Loading...</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-medium">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
