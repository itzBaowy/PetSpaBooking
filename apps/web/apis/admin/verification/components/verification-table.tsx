"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionMenu } from "@/components/ui/action-menu";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { useDebounce } from "@/hooks/use-debounce";
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
  const [pageSize, setPageSize] = useState(3);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const filtered = MOCK_VERIFICATIONS.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
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

  const columns: Array<DataTableColumn<MockVerificationRequest>> = [
    {
      key: "provider",
      header: "Provider",
      widthClassName: "w-[28%]",
      render: (request) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-sm font-semibold text-amber-700">
            {request.businessName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-gray-900">
              {request.businessName}
            </p>
            <p className="text-xs text-gray-500">
              {request.documentCount} document
              {request.documentCount !== 1 ? "s" : ""} submitted
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      widthClassName: "w-[22%]",
      render: (request) => (
        <div>
          <p className="break-words text-sm text-gray-800">{request.email}</p>
          <p className="text-xs text-gray-500">{request.phone}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      widthClassName: "w-[15%]",
      render: (request) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            STATUS_STYLES[request.status] ??
            "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {STATUS_LABELS[request.status] ?? request.status}
        </span>
      ),
    },
    {
      key: "submitted",
      header: "Submitted",
      widthClassName: "w-[14%]",
      render: (request) => (
        <span className="text-sm text-gray-700">
          {formatDate(request.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      isAction: true,
      widthClassName: "w-[10%]",
      render: (request) => (
        <ActionMenu
          items={[
            { label: "Review provider", onClick: () => handleView(request.id) },
            ...(request.status === "pending"
              ? [
                  {
                    label: "Approve provider",
                    onClick: () => handleQuickApprove(request.id),
                  },
                  {
                    label: "Reject provider",
                    onClick: () => handleQuickReject(request.id),
                    variant: "danger" as const,
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <StatisticCardGrid columns={4}>
        {[
          {
            label: "Pending",
            count: pendingCount,
            tone: "amber" as const,
          },
          {
            label: "Approved",
            count: approvedCount,
            tone: "green" as const,
          },
          {
            label: "Rejected",
            count: rejectedCount,
            tone: "red" as const,
          },
          {
            label: "Info Requested",
            count: infoCount,
            tone: "blue" as const,
          },
        ].map((stat) => (
          <StatisticCard
            key={stat.label}
            title={stat.label}
            value={stat.count}
            tone={stat.tone}
          />
        ))}
      </StatisticCardGrid>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            className="w-full lg:max-w-md"
            value={search}
            placeholder="Search provider name or email"
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
          <CustomSelect
            className="w-full lg:w-52"
            defaultValue={statusFilter}
            options={STATUS_FILTERS}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          />
          <div className="text-sm font-medium text-gray-500 lg:ml-auto">
            {debouncedSearch || statusFilter
              ? `${total} matching request${total === 1 ? "" : "s"}`
              : `${total} total request${total === 1 ? "" : "s"}`}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={records}
        getRowKey={(request) => request.id}
        minWidthClassName="min-w-[1120px]"
        emptyState={
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
        }
      />

      <div className="px-2">
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
  );
}
