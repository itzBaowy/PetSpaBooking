"use client";

export function VerificationTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">
              Provider
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium">
              Submitted
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-6 py-4">No pending verifications</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
