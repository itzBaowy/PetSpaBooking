"use client";

import { useState } from "react";
import { CustomSelect } from "@/components/ui/custom-select";
import { ActionMenu } from "@/components/ui/action-menu";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { useModerationQueue, useReports } from "../queries";
import type { ModerationItem } from "../queries";

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const total = moderationQueue.data.length;
  const totalPages = Math.ceil(total / pageSize);
  const records = moderationQueue.data.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const pendingCount = moderationQueue.data.filter(
    (item) => item.status === "PENDING",
  ).length;
  const highRiskCount = moderationQueue.data.filter(
    (item) => item.risk === "HIGH",
  ).length;
  const openReportCount = reports.data.filter(
    (report) => report.status === "OPEN",
  ).length;
  const columns: Array<DataTableColumn<ModerationItem>> = [
    {
      key: "content",
      header: "Content",
      widthClassName: "w-[26%]",
      render: (item) => (
        <div>
          <p className="break-words font-semibold text-gray-900">
            {item.serviceName}
          </p>
          <p className="text-xs text-gray-500">
            {item.id} / {item.submittedAt}
          </p>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      widthClassName: "w-[18%]",
      render: (item) => item.providerName,
    },
    {
      key: "type",
      header: "Type",
      widthClassName: "w-[12%]",
      render: (item) => item.type,
    },
    {
      key: "risk",
      header: "Risk",
      widthClassName: "w-[12%]",
      render: (item) => (
        <Badge label={item.risk} className={riskStyles[item.risk]} />
      ),
    },
    {
      key: "status",
      header: "Status",
      widthClassName: "w-[14%]",
      render: (item) => (
        <Badge
          label={item.status}
          className={contentStatusStyles[item.status]}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      isAction: true,
      widthClassName: "w-[8%]",
      render: () => (
        <ActionMenu
          items={[
            { label: "Approve content" },
            { label: "Request edits" },
            { label: "Hide content", variant: "danger" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        eyebrow="Admin / Content Moderation"
        title="Moderation"
        description="Review service content, images, price tables, and user reports before they affect the marketplace."
        actions={
          <>
            <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
              Export queue
            </button>
            <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              Review next item
            </button>
          </>
        }
      />

      <StatisticCardGrid columns={3}>
        <StatisticCard title="Pending content" value={pendingCount} />
        <StatisticCard
          title="Open reports"
          value={openReportCount}
          tone="red"
        />
        <StatisticCard
          title="High risk reviews"
          value={highRiskCount}
          tone="amber"
        />
      </StatisticCardGrid>

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
            <SearchInput
              value=""
              onChange={() => undefined}
              className="sm:w-80"
              placeholder="Search provider, service, content ID..."
            />
            <CustomSelect
              className="sm:w-52"
              options={["All content", "Service", "Image", "Price table"]}
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={records}
          getRowKey={(item) => item.id}
          minWidthClassName="min-w-[1180px]"
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
