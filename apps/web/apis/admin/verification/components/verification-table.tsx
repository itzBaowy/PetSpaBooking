"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_VERIFICATIONS } from "../queries";
import type { MockVerificationRequest } from "../queries";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Info Requested", value: "info_requested" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  info_requested: "bg-blue-100 text-blue-800 border-blue-300",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  info_requested: "Info Requested",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function VerificationTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const pageSize = 10;

  const filtered = MOCK_VERIFICATIONS.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !r.businessName.toLowerCase().includes(q) &&
        !r.email.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const records = filtered.slice((page - 1) * pageSize, page * pageSize);

  const pendingCount = MOCK_VERIFICATIONS.filter(
    (r) => r.status === "pending",
  ).length;
  const approvedCount = MOCK_VERIFICATIONS.filter(
    (r) => r.status === "approved",
  ).length;
  const rejectedCount = MOCK_VERIFICATIONS.filter(
    (r) => r.status === "rejected",
  ).length;
  const infoCount = MOCK_VERIFICATIONS.filter(
    (r) => r.status === "info_requested",
  ).length;

  const handleView = (id: string) => {
    router.push(`/admin/verification/${id}`);
  };

  const handleQuickApprove = (id: string) => {
    if (confirm("Approve this provider verification?")) {
      alert(`Provider ${id} approved (mock)`);
    }
  };

  const handleQuickReject = (id: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      alert(`Provider ${id} rejected (mock). Reason: ${reason}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: "pending", count: pendingCount },
          { label: "Approved", value: "approved", count: approvedCount },
          { label: "Rejected", value: "rejected", count: rejectedCount },
          { label: "Info Requested", value: "info_requested", count: infoCount },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setStatusFilter(filter.value);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-left ${
              statusFilter === filter.value
                ? STATUS_STYLES[filter.value]
                : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="text-xs text-gray-600 block">
              {filter.label}
            </span>
            <span className="text-lg font-bold text-gray-900">{filter.count}</span>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by provider or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {records.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className="font-medium text-gray-700">No verification requests found</p>
            <p className="text-xs text-gray-500 mt-1">
              {statusFilter
                ? `No ${STATUS_LABELS[statusFilter]?.toLowerCase()} requests`
                : "New provider registrations will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((request: MockVerificationRequest) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-semibold text-sm">
                          {request.businessName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {request.businessName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.documentCount} document
                            {request.documentCount !== 1 ? "s" : ""} submitted
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800">{request.email}</p>
                      <p className="text-xs text-gray-500">{request.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          STATUS_STYLES[request.status] ??
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {STATUS_LABELS[request.status] ?? request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {formatDate(request.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(request.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Review
                        </button>
                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleQuickApprove(request.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleQuickReject(request.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-700">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}