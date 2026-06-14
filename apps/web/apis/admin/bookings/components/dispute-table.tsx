"use client";

import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import { useDisputeBookings } from "../queries";

const disputeStatusStyles = {
  OPEN: "border-red-200 bg-red-50 text-red-700",
  REVIEWING: "border-blue-200 bg-blue-50 text-blue-700",
  RESOLVED: "border-green-200 bg-green-50 text-green-700",
};

export function DisputeTable() {
  const disputes = useDisputeBookings();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  const total = disputes.data.length;
  const totalPages = Math.ceil(total / pageSize);
  const records = disputes.data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-900">Dispute queue</h2>
        <p className="text-sm text-gray-500">
          Cases between Pet Owners and Service Providers.
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {records.map((dispute) => (
          <div key={dispute.id} className="p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-gray-900">{dispute.id}</h3>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${disputeStatusStyles[dispute.status]}`}
                  >
                    {dispute.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{dispute.issue}</p>
                <p className="mt-2 text-xs text-gray-400">
                  Booking {dispute.bookingId} / {dispute.petOwner} vs{" "}
                  {dispute.provider}
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
      <div className="border-t border-gray-100 px-5 py-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          pageSizeOptions={[1, 2, 5]}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
