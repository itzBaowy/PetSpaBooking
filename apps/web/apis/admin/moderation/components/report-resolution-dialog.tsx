"use client";

import { CustomSelect } from "@/components/ui/custom-select";

export function ReportResolutionDialog() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="font-semibold">Resolve Report</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Action</label>
        <CustomSelect
          options={["Select action", "Dismiss", "Warning", "Suspend", "Ban"]}
        />
      </div>
      <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Apply Action
      </button>
    </div>
  );
}
