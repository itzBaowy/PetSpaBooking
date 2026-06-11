"use client";

export function VerificationActions() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-3">
      <h3 className="font-semibold">Actions</h3>
      <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
        Approve
      </button>
      <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">
        Reject
      </button>
      <button className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
        Request Info
      </button>
    </div>
  );
}
