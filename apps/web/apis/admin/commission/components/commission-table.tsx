"use client";

import { useMemo, useState } from "react";
import { ActionMenu } from "@/components/ui/action-menu";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { useToast } from "@/components/ui/feedback-provider";
import { COMMISSION_STATUS_LABELS } from "@/constants/commission";
import type { DataTableColumn } from "@/components/ui/data-table";
import type { Commission } from "@/types/commission";
import { useCommissionRecords } from "../queries";
import { formatCurrency } from "./commission-format";
import { CommissionStatusPill } from "./commission-status-pill";

const statusOptions = [
  { label: "Tất cả trạng thái", value: "ALL" },
  ...Object.entries(COMMISSION_STATUS_LABELS).map(([value, label]) => ({
    label,
    value,
  })),
];

const fundStatusLabels: Record<string, string> = {
  HELD: "Đang giữ",
  NOT_HELD: "Không giữ",
  REFUND_PENDING: "Chờ hoàn",
  REFUNDED: "Đã hoàn tiền",
  SETTLED_TO_PROVIDER: "Đã settle",
};

const fundSourceLabels: Record<string, string> = {
  CUSTOMER_ONLINE_PAYMENT: "Khách thanh toán online",
  CUSTOMER_CASH_TO_PROVIDER: "Khách trả tiền mặt cho provider",
  NONE: "Không có dòng tiền",
};

function labelFromMap(labels: Record<string, string>, value: string) {
  return labels[value] ?? value.replaceAll("_", " ");
}

export function CommissionTable() {
  const { showToast } = useToast();
  const { data: commissions } = useCommissionRecords();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const filteredCommissions = useMemo(
    () =>
      commissions.filter((commission) => {
        const matchesStatus = status === "ALL" || commission.status === status;
        const matchesSearch = [
          commission.id,
          commission.bookingId,
          commission.providerName,
          commission.serviceName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [commissions, search, status],
  );

  const columns: Array<DataTableColumn<Commission>> = [
    {
      key: "commission",
      header: "Hoa hồng",
      widthClassName: "w-[18%]",
      render: (commission) => (
        <div>
          <p className="font-bold text-foreground">{commission.id}</p>
          <p className="text-xs text-muted">{commission.bookingId}</p>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Nhà cung cấp",
      render: (commission) => (
        <div>
          <p className="font-semibold">{commission.providerName}</p>
          <p className="text-xs text-muted">{commission.serviceName}</p>
        </div>
      ),
    },
    {
      key: "bookingAmount",
      header: "Tổng",
      align: "right",
      render: (commission) => formatCurrency(commission.bookingAmount),
    },
    {
      key: "heldAmount",
      header: "Tiền đang giữ",
      align: "right",
      render: (commission) => (
        <div>
          <p className="font-bold text-warning">
            {formatCurrency(commission.heldAmount)}
          </p>
          <p className="text-xs text-muted">
            {labelFromMap(fundStatusLabels, commission.fundStatus)}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Hoa hồng",
      align: "right",
      render: (commission) => (
        <span className="font-bold">
          {formatCurrency(commission.commissionAmount)}
        </span>
      ),
    },
    {
      key: "providerEarning",
      header: "Provider thực nhận",
      align: "right",
      render: (commission) => formatCurrency(commission.providerEarning),
    },
    {
      key: "rate",
      header: "Tỷ lệ",
      render: (commission) => commission.rateLabel,
    },
    {
      key: "fund",
      header: "Nguồn tiền",
      render: (commission) => (
        <div>
          <p className="font-semibold">{commission.paymentMethod}</p>
          <p className="text-xs text-muted">
            {labelFromMap(fundSourceLabels, commission.fundSource)}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Hoa hồng",
      render: (commission) => (
        <CommissionStatusPill status={commission.displayStatus} />
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      isAction: true,
      render: (commission) => (
        <ActionMenu
          items={[
            {
              label: "Xem đặt lịch",
              onClick: () =>
                showToast(
                  `Booking ${commission.bookingId}: giữ ${formatCurrency(commission.heldAmount)}, hoa hồng ${formatCurrency(commission.commissionAmount)}.`,
                  "info",
                ),
            },
            {
              label: "Xem sổ cái",
              onClick: () => {
                window.location.href = "/admin/finance/ledger";
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface p-4 shadow-sm md:flex-row md:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm hoa hồng, đặt lịch, nhà cung cấp..."
          className="md:max-w-lg"
        />
        <CustomSelect
          className="md:w-56"
          options={statusOptions}
          defaultValue="ALL"
          onValueChange={setStatus}
        />
      </div>
      <DataTable
        columns={columns}
        data={filteredCommissions}
        getRowKey={(commission) => commission.id}
        minWidthClassName="min-w-[1320px]"
      />
    </section>
  );
}
