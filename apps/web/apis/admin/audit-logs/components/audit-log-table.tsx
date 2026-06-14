"use client";

import { useState } from "react";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { useAuditLogs } from "../queries";
import type { AuditLogItem } from "../queries";

const actionStyles = {
  CONTENT_APPROVED: "border-green-200 bg-green-50 text-green-700",
  CONTENT_HIDDEN: "border-red-200 bg-red-50 text-red-700",
  REPORT_RESOLVED: "border-blue-200 bg-blue-50 text-blue-700",
  DISPUTE_REFUNDED: "border-purple-200 bg-purple-50 text-purple-700",
  BOOKING_STATUS_UPDATED: "border-amber-200 bg-amber-50 text-amber-700",
  ACCOUNT_LOCKED: "border-gray-200 bg-gray-50 text-gray-700",
};

export function AuditLogTable() {
  const auditLogs = useAuditLogs();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const total = auditLogs.data.length;
  const totalPages = Math.ceil(total / pageSize);
  const records = auditLogs.data.slice((page - 1) * pageSize, page * pageSize);
  const columns: Array<DataTableColumn<AuditLogItem>> = [
    {
      key: "id",
      header: "Log ID",
      widthClassName: "w-[12%]",
      render: (log) => <span className="font-semibold text-gray-900">{log.id}</span>,
    },
    {
      key: "actor",
      header: "Actor",
      widthClassName: "w-[16%]",
      render: (log) => (
        <div>
          <p className="font-semibold text-gray-900">{log.actorName}</p>
          <p className="text-xs text-gray-500">{log.actorRole}</p>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      widthClassName: "w-[20%]",
      render: (log) => (
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${actionStyles[log.actionType]}`}
        >
          {log.actionType}
        </span>
      ),
    },
    {
      key: "target",
      header: "Target",
      widthClassName: "w-[18%]",
      render: (log) => log.target,
    },
    {
      key: "note",
      header: "Audit Note",
      widthClassName: "w-[24%]",
      render: (log) => <span className="text-gray-600">{log.note}</span>,
    },
    {
      key: "time",
      header: "Time",
      widthClassName: "w-[14%]",
      render: (log) => log.createdAt,
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <nav className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Admin / Audit Logs
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Audit Logs
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Track admin decisions for content moderation, reports, booking
            disputes, refunds, and account actions.
          </p>
        </div>
        <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
          Export audit log
        </button>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-2 md:flex-row">
            <SearchInput
              value=""
              onChange={() => undefined}
              className="md:w-96"
              placeholder="Search action, actor, target..."
            />
            <CustomSelect
              className="md:w-48"
              options={["All roles", "ADMIN", "PET_OWNER", "SERVICE_PROVIDER"]}
            />
            <CustomSelect
              className="md:w-64"
              options={[
                "All actions",
                "DISPUTE_REFUNDED",
                "BOOKING_STATUS_UPDATED",
                "CONTENT_HIDDEN",
                "REPORT_RESOLVED",
              ]}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={records}
          getRowKey={(log) => log.id}
          minWidthClassName="min-w-[1120px]"
        />
        <div className="border-t border-gray-100 px-5 py-4">
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
      </div>
    </div>
  );
}
