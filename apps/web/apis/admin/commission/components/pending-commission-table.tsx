"use client";

import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import type { Commission } from "@/types/commission";
import { usePendingCommissions } from "../queries";
import { formatCurrency } from "./commission-format";
import { CommissionStatusPill } from "./commission-status-pill";

const fundStatusLabels: Record<string, string> = {
  HELD: "Đang giữ tiền khách",
  NOT_HELD: "Không giữ gross",
  REFUND_PENDING: "Chờ hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
  SETTLED_TO_PROVIDER: "Đã settle",
};

function formatReservedAt(value?: string | null) {
  if (!value) return "Chưa giữ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function PendingCommissionTable() {
  const { data: commissions } = usePendingCommissions();
  const columns: Array<DataTableColumn<Commission>> = [
    {
      key: "booking",
      header: "Đặt lịch",
      widthClassName: "w-[15%]",
      render: (commission) => (
        <div className="min-w-0" title={commission.bookingId}>
          <p className="font-bold text-brand">#{commission.bookingId.slice(-8)}</p>
          <p className="mt-1 break-words text-xs leading-4 text-muted">{commission.serviceName}</p>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Nhà cung cấp",
      widthClassName: "w-[15%]",
      render: (commission) => <span className="block break-words font-semibold leading-5">{commission.providerName}</span>,
    },
    {
      key: "reserved",
      header: "Giữ lúc",
      widthClassName: "w-[17%]",
      render: (commission) => <span className="block text-sm leading-5 text-muted">{formatReservedAt(commission.reservedAt)}</span>,
    },
    {
      key: "held",
      header: "Tiền khách đang giữ",
      align: "right",
      widthClassName: "w-[16%]",
      render: (commission) => (
        <div>
          <p className="font-bold text-warning">
            {formatCurrency(commission.heldAmount)}
          </p>
          <p className="text-xs text-muted">
            {fundStatusLabels[commission.fundStatus] ?? commission.fundStatus}
          </p>
        </div>
      ),
    },
    {
      key: "commission",
      header: "Hoa hồng dự kiến",
      align: "right",
      widthClassName: "w-[13%]",
      render: (commission) => formatCurrency(commission.commissionAmount),
    },
    {
      key: "net",
      header: "Provider thực nhận",
      align: "right",
      widthClassName: "w-[13%]",
      render: (commission) => formatCurrency(commission.providerEarning),
    },
    {
      key: "status",
      header: "Trạng thái",
      widthClassName: "w-[11%]",
      render: (commission) => (
        <CommissionStatusPill status={commission.displayStatus} />
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Hoa hồng chờ xử lý
        </h2>
        <p className="text-sm text-muted">
          Tách rõ tiền khách đang giữ trên sàn và hoa hồng dự kiến phải thu.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={commissions}
        getRowKey={(commission) => commission.id}
        minWidthClassName="min-w-[1120px]"
      />
    </section>
  );
}
