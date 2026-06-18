"use client";

export function ModerationTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">
              Content ID
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium">Type</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-6 py-4">No content to moderate</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
