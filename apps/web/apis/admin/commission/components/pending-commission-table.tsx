"use client";

import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import type { Commission } from "@/types/commission";
import { usePendingCommissions } from "../queries";
import { formatCurrency } from "./commission-format";
import { CommissionStatusPill } from "./commission-status-pill";

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
      key: "amount",
      header: "Số tiền",
      align: "right",
      render: (commission) => formatCurrency(commission.commissionAmount),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (commission) => (
        <CommissionStatusPill status={commission.status} />
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
          Hoa hồng đã giữ, đang chờ hoàn tất đặt lịch hoặc hoàn giữ.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={commissions}
        getRowKey={(commission) => commission.id}
        minWidthClassName="min-w-[860px]"
      />
    </section>
  );
}
