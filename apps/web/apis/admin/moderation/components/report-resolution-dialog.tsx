"use client";

export function ReportResolutionDialog() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="font-semibold">Resolve Report</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Action</label>
        <select className="w-full border rounded px-3 py-2">
          <option>Select action</option>
          <option>Dismiss</option>
          <option>Warning</option>
          <option>Suspend</option>
          <option>Ban</option>
        </select>
      </div>
      <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Apply Action
      </button>
    </div>
  );
}
