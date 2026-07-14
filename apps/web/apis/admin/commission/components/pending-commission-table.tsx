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

export function PendingCommissionTable() {
  const { data: commissions } = usePendingCommissions();
  const columns: Array<DataTableColumn<Commission>> = [
    {
      key: "booking",
      header: "Đặt lịch",
      render: (commission) => (
        <div>
          <p className="font-bold text-foreground">{commission.bookingId}</p>
          <p className="text-xs text-muted">{commission.serviceName}</p>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Nhà cung cấp",
      render: (commission) => commission.providerName,
    },
    {
      key: "reserved",
      header: "Giữ lúc",
      render: (commission) => commission.reservedAt ?? "Chưa giữ",
    },
    {
      key: "held",
      header: "Tiền khách đang giữ",
      align: "right",
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
      render: (commission) => formatCurrency(commission.commissionAmount),
    },
    {
      key: "net",
      header: "Provider thực nhận",
      align: "right",
      render: (commission) => formatCurrency(commission.providerEarning),
    },
    {
      key: "status",
      header: "Trạng thái",
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
        minWidthClassName="min-w-[1040px]"
      />
    </section>
  );
}
