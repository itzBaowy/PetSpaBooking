"use client";

export function CustomerDetail() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">Customer Information</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-gray-600">Name</p>
          <p className="font-medium">Loading...</p>
        </div>
        <div>
          <p className="text-gray-600">Email</p>
          <p className="font-medium">Loading...</p>
        </div>
        <div>
          <p className="text-gray-600">Phone</p>
          <p className="font-medium">Loading...</p>
        </div>
      </div>
    </div>
  );
}
