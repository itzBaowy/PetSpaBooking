"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { nested, textValue, type AdminEntity } from "@/apis/admin/supported-api";
import { displayValue, StatusPill } from "../shared";

const METADATA_LABELS: Record<string, string> = {
  previousStatus: "Trước",
  status: "Sau",
  reason: "Lý do",
  adminNote: "Ghi chú",
  note: "Ghi chú",
  amount: "Số tiền",
  balanceType: "Loại số dư",
  bookingId: "Booking",
  customerId: "Khách hàng",
  providerId: "Nhà cung cấp",
  serviceId: "Dịch vụ",
  documentType: "Loại tài liệu",
  transactionId: "Giao dịch",
  previousPaymentStatus: "Thanh toán trước",
  paymentStatus: "Thanh toán sau",
  refundReference: "Mã tham chiếu hoàn tiền",
  notificationId: "Thông báo",
  type: "Loại",
  userRole: "Vai trò người nhận",
  userStatus: "Trạng thái người nhận",
  role: "Vai trò",
  count: "Số lượng",
};

function metadataEntries(log: AdminEntity) {
  if (!log.metadata || typeof log.metadata !== "object" || Array.isArray(log.metadata)) return [];
  return Object.entries(log.metadata as Record<string, unknown>).filter(([, value]) => value !== null && value !== undefined && value !== "");
}

function MetadataSummary({ log }: { log: AdminEntity }) {
  const entries = metadataEntries(log);
  if (!entries.length) return <span className="text-muted">Không có ghi chú</span>;

  return (
    <div className="space-y-1 text-xs">
      {entries.map(([key, value]) => (
        <p key={key} className="break-words">
          <span className="font-semibold text-muted">{METADATA_LABELS[key] ?? key}: </span>
          <span className="text-foreground">{displayValue(value, key === "amount" ? "amount" : key)}</span>
        </p>
      ))}
    </div>
  );
}

export function AuditLogDataTable({ loading, items }: { loading: boolean; items?: AdminEntity[] }) {
  if (loading) return <p className="rounded-2xl border bg-surface p-6">Đang tải dữ liệu...</p>;

  const columns: Array<DataTableColumn<AdminEntity>> = [
    {
      key: "admin",
      header: "Người thực hiện",
      render: (log) => (
        <div>
          <p className="font-semibold text-foreground">{textValue(nested(log, "admin", "fullName"), textValue(nested(log, "admin", "userName")))}</p>
          <p className="text-xs text-muted">@{textValue(nested(log, "admin", "userName"))}</p>
          <p className="text-xs text-subtle">{textValue(nested(log, "admin", "email"))}</p>
        </div>
      ),
    },
    {
      key: "action",
      header: "Hành động",
      render: (log) => <StatusPill value={log.action} />,
    },
    {
      key: "target",
      header: "Đối tượng bị tác động",
      render: (log) => (
        <div>
          <p className="font-semibold text-foreground">{displayValue(log.targetType)}</p>
          <p className="mt-1 break-all font-mono text-xs text-muted">{textValue(log.targetId)}</p>
        </div>
      ),
    },
    {
      key: "metadata",
      header: "Nội dung thay đổi",
      render: (log) => <MetadataSummary log={log} />,
    },
    {
      key: "createAt",
      header: "Thời gian",
      render: (log) => <span className="whitespace-nowrap">{displayValue(log.createAt, "createAt")}</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items ?? []}
      getRowKey={(log) => log.id}
      minWidthClassName="min-w-[1180px]"
      emptyState={<div className="p-8 text-center text-sm font-semibold text-muted">Chưa có nhật ký quản trị.</div>}
    />
  );
}
