"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  PageTitle,
  LoadState,
  useAdminList,
  FilterSelect,
  EntityTable,
  Pager,
  inputClass,
} from "../shared";

export function AdminLedgerPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [type, setType] = useState("");
  const [balanceType, setBalanceType] = useState("");
  const [providerId, setProviderId] = useState("");
  const [bookingId, setBookingId] = useState("");

  const query = useAdminList("ledger", API_ENDPOINTS.ADMIN.WALLET_TRANSACTIONS, {
    page,
    pageSize,
    type,
    balanceType,
    providerId,
    bookingId,
  });

  if (query.isError) return <LoadState error={query.error} retry={() => void query.refetch()} />;

  const typeOptions = [
    { value: "", label: "Mọi loại giao dịch" },
    { value: "ONLINE_EARNING", label: "Doanh thu trực tuyến" },
    { value: "CASH_COMMISSION_DEDUCTION", label: "Trừ hoa hồng tiền mặt" },
    { value: "DEPOSIT_COMMISSION_DEDUCTION", label: "Trừ hoa hồng từ ký quỹ" },
    { value: "MANUAL_ADJUSTMENT", label: "Điều chỉnh thủ công" },
    { value: "WITHDRAWAL_PAYOUT", label: "Chi trả rút tiền" },
  ];

  const balanceTypeOptions = [
    { value: "", label: "Mọi số dư" },
    { value: "WALLET", label: "Ví" },
    { value: "DEPOSIT", label: "Ký quỹ" },
  ];

  return (
    <div className="space-y-5">
      <PageTitle title="Sổ cái ví và ký quỹ" description="Các giao dịch tài chính thực tế từ máy chủ." />
      <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <input
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            placeholder="Mã nhà cung cấp"
            className={inputClass}
          />
          <input
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder="Mã lịch đặt"
            className={inputClass}
          />
          <FilterSelect
            className="w-full sm:w-56"
            value={type}
            options={typeOptions}
            onChange={(v) => {
              setType(v);
              setPage(1);
            }}
          />
          <FilterSelect
            className="w-full sm:w-48"
            value={balanceType}
            options={balanceTypeOptions}
            onChange={(v) => {
              setBalanceType(v);
              setPage(1);
            }}
          />
          <span className="text-sm font-medium text-muted self-center ml-auto">
            {query.isFetching ? "Đang tải..." : `${query.data?.pagination.totalItems ?? 0} giao dịch`}
          </span>
        </div>
      </div>
      <EntityTable
        loading={query.isLoading}
        items={query.data?.items}
        columns={[
          "provider.businessName",
          "booking.id",
          "booking.customer.users.fullName",
          "booking.service.name",
          "type",
          "balanceType",
          "amount",
          "balanceAfter",
          "createAt",
        ]}
      />
      <Pager data={query.data} setPage={setPage} setPageSize={setPageSize} />
    </div>
  );
}
