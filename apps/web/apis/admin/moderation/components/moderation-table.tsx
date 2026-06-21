"use client";

import Link from "next/link";
import { useState } from "react";
import { CustomSelect } from "@/components/ui/custom-select";
import { ActionMenu } from "@/components/ui/action-menu";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import {
  StatisticCard,
  StatisticCardGrid,
} from "@/components/ui/statistic-card";
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

const contentStatusLabels = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  HIDDEN: "Đã ẩn",
  NEEDS_REVISION: "Cần chỉnh sửa",
};

const riskLabels = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
};

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
      header: "Nội dung",
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
      header: "Nhà cung cấp",
      widthClassName: "w-[18%]",
      render: (item) => item.providerName,
    },
    {
      key: "type",
      header: "Loại",
      widthClassName: "w-[12%]",
      render: (item) => item.type,
    },
    {
      key: "risk",
      header: "Rủi ro",
      widthClassName: "w-[12%]",
      render: (item) => (
        <Badge
          label={riskLabels[item.risk]}
          className={riskStyles[item.risk]}
        />
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      widthClassName: "w-[14%]",
      render: (item) => (
        <Badge
          label={contentStatusLabels[item.status]}
          className={contentStatusStyles[item.status]}
        />
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
            { label: "Duyệt nội dung" },
            { label: "Yêu cầu chỉnh sửa" },
            { label: "Ẩn nội dung", variant: "danger" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        eyebrow="Quản trị / Kiểm duyệt nội dung"
        title="Kiểm duyệt"
        description="Duyệt nội dung dịch vụ, hình ảnh, bảng giá và báo cáo trước khi ảnh hưởng đến sàn."
        actions={
          <>
            <Link
              href="/admin/moderation"
              className="rounded-xl bg-foreground px-4 py-2 text-sm font-bold text-background shadow-sm"
            >
              Hàng đợi nội dung
            </Link>
            <Link
              href="/admin/moderation/reports"
              className="rounded-xl border border-border-subtle bg-surface px-4 py-2 text-sm font-bold text-foreground shadow-sm hover:bg-surface-muted"
            >
              Báo cáo
            </Link>
          </>
        }
      />

      <StatisticCardGrid columns={3}>
        <StatisticCard title="Nội dung chờ duyệt" value={pendingCount} />
        <StatisticCard
          title="Báo cáo đang mở"
          value={openReportCount}
          tone="red"
        />
        <StatisticCard
          title="Rà soát rủi ro cao"
          value={highRiskCount}
          tone="amber"
        />
      </StatisticCardGrid>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Hàng đợi nội dung dịch vụ
            </h2>
            <p className="text-sm text-gray-500">
              Duyệt, ẩn hoặc yêu cầu chỉnh sửa nội dung của nhà cung cấp.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SearchInput
              value=""
              onChange={() => undefined}
              className="sm:w-80"
              placeholder="Tìm nhà cung cấp, dịch vụ, mã nội dung..."
            />
            <CustomSelect
              className="sm:w-52"
              options={["Tất cả nội dung", "Dịch vụ", "Hình ảnh", "Bảng giá"]}
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={records}
          getRowKey={(item) => item.id}
          minWidthClassName="min-w-[1180px]"
        />
        <div className="px-2 py-1">
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
