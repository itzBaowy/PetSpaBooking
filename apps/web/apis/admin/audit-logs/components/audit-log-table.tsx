"use client";

import { useState } from "react";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
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

const actionLabels: Record<AuditLogItem["actionType"], string> = {
  CONTENT_APPROVED: "Duyệt nội dung",
  CONTENT_HIDDEN: "Ẩn nội dung",
  REPORT_RESOLVED: "Xử lý báo cáo",
  DISPUTE_REFUNDED: "Hoàn tiền tranh chấp",
  BOOKING_STATUS_UPDATED: "Cập nhật trạng thái đặt lịch",
  ACCOUNT_LOCKED: "Khóa tài khoản",
};

const roleLabels: Record<AuditLogItem["actorRole"], string> = {
  ADMIN: "Quản trị viên",
  PET_OWNER: "Chủ thú cưng",
  SERVICE_PROVIDER: "Nhà cung cấp dịch vụ",
};

export function AuditLogTable() {
  const auditLogs = useAuditLogs();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [action, setAction] = useState("ALL");
  const filteredLogs = auditLogs.data.filter((log) => {
    const matchesRole = role === "ALL" || log.actorRole === role;
    const matchesAction = action === "ALL" || log.actionType === action;
    const matchesSearch = [log.id, log.actorName, log.target, log.note, actionLabels[log.actionType]]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesAction && matchesSearch;
  });
  const total = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const records = filteredLogs.slice((page - 1) * pageSize, page * pageSize);
  const columns: Array<DataTableColumn<AuditLogItem>> = [
    {
      key: "id",
      header: "Mã log",
      widthClassName: "w-[12%]",
      render: (log) => (
        <span className="font-semibold text-gray-900">{log.id}</span>
      ),
    },
    {
      key: "actor",
      header: "Người thực hiện",
      widthClassName: "w-[16%]",
      render: (log) => (
        <div>
          <p className="font-semibold text-gray-900">{log.actorName}</p>
          <p className="text-xs text-gray-500">{roleLabels[log.actorRole]}</p>
        </div>
      ),
    },
    {
      key: "action",
      header: "Hành động",
      widthClassName: "w-[20%]",
      render: (log) => (
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${actionStyles[log.actionType]}`}
        >
          {actionLabels[log.actionType]}
        </span>
      ),
    },
    {
      key: "target",
      header: "Đối tượng",
      widthClassName: "w-[18%]",
      render: (log) => log.target,
    },
    {
      key: "note",
      header: "Ghi chú kiểm toán",
      widthClassName: "w-[24%]",
      render: (log) => <span className="text-gray-600">{log.note}</span>,
    },
    {
      key: "time",
      header: "Thời gian",
      widthClassName: "w-[14%]",
      render: (log) => log.createdAt,
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        eyebrow="Quản trị / Nhật ký"
        title="Nhật ký kiểm toán"
        description="Theo dõi quyết định của quản trị viên về kiểm duyệt nội dung, báo cáo, tranh chấp đặt lịch, hoàn tiền và thao tác tài khoản."
        actions={
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
            Xuất nhật ký
          </button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-2 md:flex-row">
            <SearchInput
              value={search}
              onChange={(value) => { setSearch(value); setPage(1); }}
              className="md:w-96"
              placeholder="Tìm hành động, người thực hiện, đối tượng..."
            />
            <CustomSelect
              className="md:w-48"
              value={role}
              options={[{ label: "Tất cả vai trò", value: "ALL" }, { label: "Quản trị viên", value: "ADMIN" }, { label: "Chủ thú cưng", value: "PET_OWNER" }, { label: "Nhà cung cấp dịch vụ", value: "SERVICE_PROVIDER" }]}
              onValueChange={(value) => { setRole(value); setPage(1); }}
            />
            <CustomSelect
              className="md:w-64"
              value={action}
              options={[{ label: "Tất cả hành động", value: "ALL" }, ...Object.entries(actionLabels).map(([value, label]) => ({ value, label }))]}
              onValueChange={(value) => { setAction(value); setPage(1); }}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={records}
          getRowKey={(log) => log.id}
          minWidthClassName="min-w-[1120px]"
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
