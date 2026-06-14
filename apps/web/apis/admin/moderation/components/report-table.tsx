"use client";

import { useState } from "react";
import { ActionMenu } from "@/components/ui/action-menu";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { useReports } from "../queries";
import type { ReportStatus, UserReport } from "../queries";

const REPORT_STATUS_FILTERS: Array<{ label: string; value: "" | ReportStatus }> =
  [
    { label: "All statuses", value: "" },
    { label: "Open", value: "OPEN" },
    { label: "Investigating", value: "INVESTIGATING" },
    { label: "Resolved", value: "RESOLVED" },
  ];

const reportStatusStyles = {
  OPEN: "border-red-200 bg-red-50 text-red-700",
  INVESTIGATING: "border-blue-200 bg-blue-50 text-blue-700",
  RESOLVED: "border-green-200 bg-green-50 text-green-700",
};

export function ReportTable() {
  const reports = useReports();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ReportStatus>("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);

  const filteredReports = reports.data.filter((report) => {
    if (statusFilter && report.status !== statusFilter) return false;

    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return true;

    return [
      report.id,
      report.target,
      report.targetType,
      report.reporterRole,
      report.reason,
      report.createdAt,
    ].some((value) => value.toLowerCase().includes(query));
  });
  const total = filteredReports.length;
  const totalPages = Math.ceil(total / pageSize);
  const records = filteredReports.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const columns: Array<DataTableColumn<UserReport>> = [
    {
      key: "report",
      header: "Report",
      widthClassName: "w-[17%]",
      render: (report) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">{report.id}</p>
          <p className="mt-1 text-xs font-medium text-gray-500">
            {report.targetType} / {report.reporterRole}
          </p>
        </div>
      ),
    },
    {
      key: "target",
      header: "Target",
      widthClassName: "w-[20%]",
      render: (report) => (
        <p className="break-words text-sm font-semibold text-gray-900">
          {report.target}
        </p>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      widthClassName: "w-[30%]",
      render: (report) => (
        <p className="line-clamp-2 text-sm text-gray-600">{report.reason}</p>
      ),
    },
    {
      key: "status",
      header: "Status",
      widthClassName: "w-[14%]",
      render: (report) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${reportStatusStyles[report.status]}`}
        >
          {report.status}
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      widthClassName: "w-[13%]",
      render: (report) => (
        <span className="text-sm text-gray-700">{report.createdAt}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      isAction: true,
      widthClassName: "w-[8%]",
      render: (report) => (
        <ActionMenu
          items={[
            {
              label: "Dismiss report",
              onClick: () => alert(`${report.id} dismissed (mock)`),
            },
            {
              label: "Hide service",
              onClick: () => alert(`${report.target} hidden (mock)`),
              variant: "danger",
            },
            {
              label: "Resolve report",
              onClick: () => alert(`${report.id} resolved (mock)`),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <div>
        <nav className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Admin / Moderation / Reports
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Content Reports
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Handle reports about providers and low quality services.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            className="w-full lg:max-w-md"
            value={search}
            placeholder="Search report ID, provider, service"
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
          <CustomSelect
            className="w-full lg:w-56"
            defaultValue={statusFilter}
            options={REPORT_STATUS_FILTERS}
            onValueChange={(value) => {
              setStatusFilter(value as "" | ReportStatus);
              setPage(1);
            }}
          />
          <div className="text-sm font-medium text-gray-500 lg:ml-auto">
            {debouncedSearch || statusFilter
              ? `${filteredReports.length} matching report${
                  filteredReports.length === 1 ? "" : "s"
                }`
              : `${filteredReports.length} total report${
                  filteredReports.length === 1 ? "" : "s"
                }`}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={records}
        getRowKey={(report) => report.id}
        minWidthClassName="min-w-[1100px]"
        emptyState={
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-gray-700">
              No reports found
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Try another search keyword or status filter.
            </p>
          </div>
        }
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
      />
    </div>
  );
}
