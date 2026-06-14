"use client";

import { useModerationQueue, useReports } from "../queries";

const contentStatusStyles = {
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-700",
  APPROVED: "border-green-200 bg-green-50 text-green-700",
  HIDDEN: "border-red-200 bg-red-50 text-red-700",
  NEEDS_REVISION: "border-purple-200 bg-purple-50 text-purple-700",
};

const riskStyles = {
  LOW: "border-green-200 bg-green-50 text-green-700",
  MEDIUM: "border-yellow-200 bg-yellow-50 text-yellow-700",
  HIGH: "border-red-200 bg-red-50 text-red-700",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

export function ModerationTable() {
  const moderationQueue = useModerationQueue();
  const reports = useReports();

  const pendingCount = moderationQueue.data.filter(
    (item) => item.status === "PENDING",
  ).length;
  const highRiskCount = moderationQueue.data.filter(
    (item) => item.risk === "HIGH",
  ).length;
  const openReportCount = reports.data.filter(
    (report) => report.status === "OPEN",
  ).length;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <nav className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Admin / Content Moderation
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Moderation & Reports
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Review service content, images, price tables, and user reports
            before they affect the marketplace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
            Export queue
          </button>
          <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Review next item
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending content</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {pendingCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Open reports</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {openReportCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            High risk reviews
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {highRiskCount}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Service content queue
            </h2>
            <p className="text-sm text-gray-500">
              Approve, hide, or request edits for provider content.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm sm:w-80"
              placeholder="Search provider, service, content ID..."
            />
            <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <option>All content</option>
              <option>Service</option>
              <option>Image</option>
              <option>Price table</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3">Content</th>
                <th className="px-5 py-3">Provider</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Risk</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {moderationQueue.data.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">
                      {item.serviceName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.id} / {item.submittedAt}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {item.providerName}
                  </td>
                  <td className="px-5 py-4 text-gray-700">{item.type}</td>
                  <td className="px-5 py-4">
                    <Badge label={item.risk} className={riskStyles[item.risk]} />
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      label={item.status}
                      className={contentStatusStyles[item.status]}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700">
                        Approve
                      </button>
                      <button className="rounded-md border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700">
                        Request edits
                      </button>
                      <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700">
                        Hide
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
          <span>Showing 1-3 of 3 content records</span>
          <div className="flex gap-1">
            <button className="rounded-md border border-gray-200 px-3 py-1">
              1
            </button>
            <button className="rounded-md border border-gray-200 px-3 py-1">
              2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
