"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ActionMenu } from "@/components/ui/action-menu";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { useToast } from "@/components/ui/feedback-provider";
import { TRUST_RISK_LABELS } from "@/constants/trust-score";
import type { DataTableColumn } from "@/components/ui/data-table";
import { useProviderBalances } from "../queries";
import type { ProviderBalanceRow } from "../queries";
import { formatCurrency } from "./finance-format";
import { FinanceStatusPill, RiskPill } from "./status-pill";

const riskOptions = [
  { label: "Tất cả mức rủi ro", value: "ALL" },
  { label: "Rủi ro thấp", value: "LOW" },
  { label: "Cần theo dõi", value: "WATCH" },
  { label: "Bị hạn chế", value: "RESTRICTED" },
  { label: "Tạm khóa", value: "SUSPENDED" },
];

export function ProviderBalanceTable() {
  const { showToast } = useToast();
  const { data: balances } = useProviderBalances();
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("ALL");

  const filteredBalances = useMemo(
    () =>
      balances.filter((provider) => {
        const matchesSearch = [provider.providerName, provider.ownerName, provider.providerId]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesRisk =
          risk === "ALL" || provider.trustScore.riskLevel === risk;
        return matchesSearch && matchesRisk;
      }),
    [balances, risk, search],
  );

  const columns: Array<DataTableColumn<ProviderBalanceRow>> = [
    {
      key: "provider",
      header: "Nhà cung cấp",
      widthClassName: "w-[25%]",
      render: (provider) => (
        <div>
          <p className="font-bold text-foreground">{provider.providerName}</p>
          <p className="text-xs text-muted">
            {provider.providerId} / {provider.ownerName}
          </p>
        </div>
      ),
    },
    {
      key: "available",
      header: "Khả dụng",
      render: (provider) => (
        <span className="font-bold text-success">
          {formatCurrency(provider.balance.availableBalance)}
        </span>
      ),
    },
    {
      key: "reserved",
      header: "Đã giữ",
      render: (provider) => formatCurrency(provider.balance.reservedBalance),
    },
    {
      key: "debt",
      header: "Công nợ",
      render: (provider) => (
        <span className={provider.balance.debtBalance > 0 ? "font-bold text-danger" : ""}>
          {formatCurrency(provider.balance.debtBalance)}
        </span>
      ),
    },
    {
      key: "trust",
      header: "Độ tin cậy",
      render: (provider) => (
        <div className="space-y-1">
          <RiskPill level={provider.trustScore.riskLevel} />
          <p className="text-xs text-muted">
            {provider.trustScore.score}/100 /{" "}
            {TRUST_RISK_LABELS[provider.trustScore.riskLevel]}
          </p>
        </div>
      ),
    },
    {
      key: "cash",
      header: "Tiền mặt",
      align: "center",
      render: (provider) => (
        <FinanceStatusPill tone={provider.cashEligible ? "success" : "danger"}>
          {provider.cashEligible ? "Đủ điều kiện" : "Đã chặn"}
        </FinanceStatusPill>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      isAction: true,
      render: (provider) => (
        <ActionMenu
          items={[
            {
              label: "Xem chi tiết số dư",
              onClick: () => {
                window.location.href = `/admin/providers/${provider.providerId}/balance`;
              },
            },
            {
              label: "Điều chỉnh số dư",
              onClick: () =>
                showToast(
                  "Dùng biểu mẫu điều chỉnh số dư ở cuối trang.",
                  "info",
                ),
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
          placeholder="Tìm nhà cung cấp, chủ sở hữu, mã..."
          className="md:max-w-md"
        />
        <CustomSelect
          className="md:w-56"
          options={riskOptions}
          defaultValue="ALL"
          onValueChange={setRisk}
        />
        <Link
          href="/admin/finance/commission"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-4 text-sm font-bold text-background shadow-sm transition-colors hover:bg-muted md:ml-auto"
        >
          Hồ sơ hoa hồng
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={filteredBalances}
        getRowKey={(provider) => provider.providerId}
        minWidthClassName="min-w-[1120px]"
        emptyState={
          <div className="p-8 text-center text-sm font-semibold text-muted">
            Không tìm thấy hồ sơ số dư nhà cung cấp.
          </div>
        }
      />
    </section>
  );
}
