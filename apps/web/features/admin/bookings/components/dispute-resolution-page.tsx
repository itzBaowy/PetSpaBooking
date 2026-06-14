"use client";

import { useBookingDisputes } from "../queries";

const disputeStatusStyles = {
  OPEN: "border-red-200 bg-red-50 text-red-700",
  REVIEWING: "border-blue-200 bg-blue-50 text-blue-700",
  RESOLVED: "border-green-200 bg-green-50 text-green-700",
};

export function DisputeResolutionPage() {
  const disputes = useBookingDisputes();

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 p-6">
      <div>
        <nav className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Admin / Bookings / Disputes
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Booking Disputes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Resolve disputes with refund, claim closure, or booking status adjustment. Every decision includes an audit log note.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900">Dispute queue</h2>
            <p className="text-sm text-gray-500">Cases between Pet Owners and Service Providers.</p>
          </div>
          <div className="divide-y divide-gray-100">
            {disputes.data.map((dispute) => (
              <div key={dispute.id} className="p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-gray-900">{dispute.id}</h3>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${disputeStatusStyles[dispute.status]}`}>
                        {dispute.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{dispute.issue}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      Booking {dispute.bookingId} / {dispute.petOwner} vs {dispute.provider}
                    </p>
                  </div>
                  <span className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
                    Requested: {dispute.requestedOutcome}
                  </span>
                </div>
                <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500">
                  Audit: {dispute.lastAuditLog}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Resolution mock form</h2>
          <p className="mt-1 text-sm text-gray-500">
            This UI captures the required audit note for admin dispute actions.
          </p>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Outcome</span>
              <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <option>REFUND</option>
                <option>CLOSE_CLAIM</option>
                <option>UPDATE_BOOKING_STATUS</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Booking status</span>
              <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <option>CONFIRMED</option>
                <option>IN_PROGRESS</option>
                <option>COMPLETED</option>
                <option>CANCELLED</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Refund amount</span>
              <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="0 VND" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Audit log note</span>
              <textarea
                className="mt-1 min-h-28 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Reason, evidence checked, and final decision..."
              />
            </label>
            <div className="flex justify-end gap-2">
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
                Save draft
              </button>
              <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">
                Resolve dispute
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
