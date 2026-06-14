"use client";

import { CustomSelect } from "@/components/ui/custom-select";

export function DisputeResolutionForm() {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Resolution mock form</h2>
      <p className="mt-1 text-sm text-gray-500">
        This UI captures the required audit note for admin dispute actions.
      </p>
      <form className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">Outcome</span>
          <CustomSelect
            className="mt-1"
            options={["REFUND", "CLOSE_CLAIM", "UPDATE_BOOKING_STATUS"]}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">
            Booking status
          </span>
          <CustomSelect
            className="mt-1"
            options={["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">
            Refund amount
          </span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="0 VND"
            type="number"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">
            Audit log note
          </span>
          <textarea
            className="mt-1 min-h-28 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Reason, evidence checked, and final decision..."
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
            type="button"
          >
            Save draft
          </button>
          <button
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
            type="button"
          >
            Resolve dispute
          </button>
        </div>
      </form>
    </div>
  );
}
