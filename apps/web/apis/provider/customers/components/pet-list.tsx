"use client";

export function PetList() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">Customer Pets</h3>
      <div className="space-y-3">
        <div className="border rounded p-3">
          <p className="text-gray-500 text-center">No pets found</p>
        </div>
      </div>
    </div>
  );
}
