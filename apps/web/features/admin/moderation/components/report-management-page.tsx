"use client";

import { useUserReports } from "../queries";

const reportStatusStyles = {
  OPEN: "border-red-200 bg-red-50 text-red-700",
  INVESTIGATING: "border-blue-200 bg-blue-50 text-blue-700",
  RESOLVED: "border-green-200 bg-green-50 text-green-700",
};

export function ReportManagementPage() {
  const reports = useUserReports();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6">
      <div>
        <nav className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Admin / Moderation / Reports
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Content Reports
        </h1>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm md:w-96"
            placeholder="Search report ID, provider, service..."
          />
          <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option>All statuses</option>
            <option>Open</option>
            <option>Investigating</option>
            <option>Resolved</option>
          </select>
        </div>
        <div className="divide-y divide-gray-100">
          {reports.data.map((report) => (
            <div key={report.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">{report.target}</h2>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${reportStatusStyles[report.status]}`}>
                    {report.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{report.reason}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {report.id} / {report.targetType} / {report.createdAt}
                </p>
              </div>
              <div className="flex gap-2 lg:justify-end">
                <button className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">
                  Warn provider
                </button>
                <button className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">
                  Hide service
                </button>
                <button className="rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white">
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
