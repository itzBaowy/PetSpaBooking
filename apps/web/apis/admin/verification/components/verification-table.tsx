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
  { label: "Tất cả", value: "" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đã duyệt", value: "approved" },
  { label: "Đã từ chối", value: "rejected" },
  { label: "Yêu cầu bổ sung", value: "info_requested" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  info_requested: "bg-blue-100 text-blue-800 border-blue-300",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
  info_requested: "Yêu cầu bổ sung",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
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
    if (confirm("Duyệt hồ sơ xác thực nhà cung cấp này?")) {
      alert(`Nhà cung cấp ${id} đã được duyệt (mock)`);
    }
  };

  const handleQuickReject = (id: string) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (reason) {
      alert(`Nhà cung cấp ${id} đã bị từ chối (mock). Lý do: ${reason}`);
    }
  };

  const columns: Array<DataTableColumn<MockVerificationRequest>> = [
    {
      key: "provider",
      header: "Nhà cung cấp",
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
              Đã nộp {request.documentCount} tài liệu
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Liên hệ",
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
      header: "Trạng thái",
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
      header: "Ngày nộp",
      widthClassName: "w-[14%]",
      render: (request) => (
        <span className="text-sm text-gray-700">
          {formatDate(request.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      isAction: true,
      widthClassName: "w-[10%]",
      render: (request) => (
        <ActionMenu
          items={[
            { label: "Xem hồ sơ", onClick: () => handleView(request.id) },
            ...(request.status === "pending"
              ? [
                  {
                    label: "Duyệt nhà cung cấp",
                    onClick: () => handleQuickApprove(request.id),
                  },
                  {
                    label: "Từ chối nhà cung cấp",
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
            label: "Chờ duyệt",
            count: pendingCount,
            tone: "amber" as const,
          },
          {
            label: "Đã duyệt",
            count: approvedCount,
            tone: "green" as const,
          },
          {
            label: "Đã từ chối",
            count: rejectedCount,
            tone: "red" as const,
          },
          {
            label: "Yêu cầu bổ sung",
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

      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            className="w-full lg:max-w-md"
            value={search}
            placeholder="Tìm tên nhà cung cấp hoặc email"
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
              ? `${total} yêu cầu phù hợp`
              : `${total} tổng yêu cầu`}
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
            <p className="font-medium text-gray-700">Không tìm thấy yêu cầu xác thực</p>
            <p className="text-xs text-gray-500 mt-1">
              {statusFilter
                ? `Không có yêu cầu trạng thái ${STATUS_LABELS[statusFilter]?.toLowerCase()}`
                : "Đăng ký nhà cung cấp mới sẽ xuất hiện tại đây"}
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
