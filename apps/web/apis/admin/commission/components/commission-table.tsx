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
      header: "Đặt lịch",
      align: "right",
      render: (commission) => formatCurrency(commission.bookingAmount),
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
      key: "rate",
      header: "Tỷ lệ",
      render: (commission) => commission.rateLabel,
    },
    {
      key: "method",
      header: "Thanh toán",
      render: (commission) => commission.paymentMethod,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (commission) => (
        <CommissionStatusPill status={commission.status} />
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
                  `Chưa có API chi tiết đặt lịch ${commission.bookingId}.`,
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
        minWidthClassName="min-w-[1120px]"
      />
    </section>
  );
}
