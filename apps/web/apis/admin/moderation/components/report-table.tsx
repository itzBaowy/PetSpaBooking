"use client";

import { useState } from "react";
import { ActionMenu } from "@/components/ui/action-menu";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { useToast } from "@/components/ui/feedback-provider";
import { useDebounce } from "@/hooks/use-debounce";
import { useReports } from "../queries";
import type { ReportStatus, UserReport } from "../queries";

const REPORT_STATUS_FILTERS: Array<{ label: string; value: "" | ReportStatus }> =
  [
    { label: "Tất cả trạng thái", value: "" },
    { label: "Đang mở", value: "OPEN" },
    { label: "Đang xử lý", value: "INVESTIGATING" },
    { label: "Đã xử lý", value: "RESOLVED" },
  ];

const reportStatusStyles = {
  OPEN: "border-red-200 bg-red-50 text-red-700",
  INVESTIGATING: "border-blue-200 bg-blue-50 text-blue-700",
  RESOLVED: "border-green-200 bg-green-50 text-green-700",
};

const reportStatusLabels: Record<ReportStatus, string> = {
  OPEN: "Đang mở",
  INVESTIGATING: "Đang xử lý",
  RESOLVED: "Đã xử lý",
};

export function ReportTable() {
  const { showToast } = useToast();
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
      header: "Báo cáo",
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
      header: "Đối tượng",
      widthClassName: "w-[20%]",
      render: (report) => (
        <p className="break-words text-sm font-semibold text-gray-900">
          {report.target}
        </p>
      ),
    },
    {
      key: "reason",
      header: "Lý do",
      widthClassName: "w-[30%]",
      render: (report) => (
        <p className="line-clamp-2 text-sm text-gray-600">{report.reason}</p>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      widthClassName: "w-[14%]",
      render: (report) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${reportStatusStyles[report.status]}`}
        >
          {reportStatusLabels[report.status]}
        </span>
      ),
    },
    {
      key: "created",
      header: "Ngày tạo",
      widthClassName: "w-[13%]",
      render: (report) => (
        <span className="text-sm text-gray-700">{report.createdAt}</span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      isAction: true,
      widthClassName: "w-[8%]",
      render: () => (
        <ActionMenu
          items={[
            {
              label: "Bỏ qua báo cáo",
              onClick: () =>
                showToast("BE chưa hỗ trợ API bỏ qua báo cáo.", "info"),
            },
            {
              label: "Ẩn dịch vụ",
              onClick: () =>
                showToast("BE chưa hỗ trợ API xử lý báo cáo.", "info"),
              variant: "danger",
            },
            {
              label: "Xử lý báo cáo",
              onClick: () =>
                showToast("BE chưa hỗ trợ API kết luận báo cáo.", "info"),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        eyebrow="Quản trị / Kiểm duyệt / Báo cáo"
        title="Báo cáo nội dung"
        description="Xử lý báo cáo về nhà cung cấp và dịch vụ kém chất lượng."
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            className="w-full lg:max-w-md"
            value={search}
            placeholder="Tìm mã báo cáo, nhà cung cấp, dịch vụ"
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
              ? `${filteredReports.length} báo cáo phù hợp`
              : `${filteredReports.length} tổng báo cáo`}
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
              Không tìm thấy báo cáo
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Thử từ khóa hoặc bộ lọc trạng thái khác.
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
