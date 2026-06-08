'use client';

export function BookingStatusActions() {
  return (
    <div className="flex gap-2">
      <button className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600">
        Confirm
      </button>
      <button className="bg-yellow-500 text-white px-3 py-1 text-sm rounded hover:bg-yellow-600">
        Reschedule
      </button>
      <button className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600">
        Cancel
      </button>
    </div>
  );
}
