"use client";

import { useMemo, useState } from "react";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { LEDGER_TRANSACTION_TYPE_LABELS } from "@/constants/ledger-types";
import type { DataTableColumn } from "@/components/ui/data-table";
import type { LedgerTransaction } from "@/types/ledger";
import { useLedgerTransactions } from "../queries";
import { formatCurrency } from "./finance-format";
import { FinanceStatusPill } from "./status-pill";

const typeOptions = [
  { label: "Tất cả loại bút toán", value: "ALL" },
  ...Object.entries(LEDGER_TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
    label,
    value,
  })),
];

export function LedgerTransactionTable({
  providerId,
}: {
  providerId?: string;
}) {
  const { data: transactions } = useLedgerTransactions();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesProvider = !providerId || transaction.providerId === providerId;
        const matchesType = type === "ALL" || transaction.type === type;
        const matchesSearch = [
          transaction.id,
          transaction.providerName,
          transaction.providerId,
          transaction.metadata.bookingId,
          transaction.metadata.reason,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesProvider && matchesType && matchesSearch;
      }),
    [providerId, search, transactions, type],
  );

  const columns: Array<DataTableColumn<LedgerTransaction>> = [
    {
      key: "id",
      header: "Bút toán",
      widthClassName: "w-[17%]",
      render: (transaction) => (
        <div>
          <p className="font-bold text-foreground">{transaction.id}</p>
          <p className="text-xs text-muted">{transaction.createdAt}</p>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Nhà cung cấp",
      render: (transaction) => (
        <div>
          <p className="font-semibold">{transaction.providerName}</p>
          <p className="text-xs text-muted">{transaction.providerId}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Loại",
      render: (transaction) => LEDGER_TRANSACTION_TYPE_LABELS[transaction.type],
    },
    {
      key: "direction",
      header: "Hướng",
      render: (transaction) => (
        <FinanceStatusPill
          tone={transaction.direction === "CREDIT" ? "success" : "warning"}
        >
          {transaction.direction === "CREDIT" ? "Cộng" : "Trừ"}
        </FinanceStatusPill>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      align: "right",
      render: (transaction) => (
        <span className="font-bold">{formatCurrency(transaction.amount)}</span>
      ),
    },
    {
      key: "balance",
      header: "Số dư sau",
      align: "right",
      render: (transaction) => formatCurrency(transaction.balanceAfter),
    },
    {
      key: "metadata",
      header: "Thông tin kèm theo",
      widthClassName: "w-[22%]",
      render: (transaction) => (
        <p className="wrap-break-word text-xs text-muted">
          {transaction.metadata.reason ??
            transaction.metadata.note ??
            transaction.metadata.bookingId ??
            "Không có thông tin"}
        </p>
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface p-4 shadow-sm md:flex-row md:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm mã bút toán, nhà cung cấp, đặt lịch..."
          className="md:max-w-lg"
        />
        <CustomSelect
          className="md:w-64"
          options={typeOptions}
          defaultValue="ALL"
          onValueChange={setType}
        />
      </div>
      <DataTable
        columns={columns}
        data={filteredTransactions}
        getRowKey={(transaction) => transaction.id}
        minWidthClassName="min-w-[1180px]"
        emptyState={
          <div className="p-8 text-center text-sm font-semibold text-muted">
            Không tìm thấy giao dịch sổ cái.
          </div>
        }
      />
    </section>
  );
}
