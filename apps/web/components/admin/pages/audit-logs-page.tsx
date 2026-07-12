"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  PageTitle,
  LoadState,
  useAdminList,
  Pager,
  inputClass,
  FilterSelect,
} from "../shared";
import { AuditLogDataTable } from "./audit-log-data-table";

export function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const query = useAdminList("audit", API_ENDPOINTS.ADMIN.AUDIT_LOGS, {
    page,
    pageSize,
    action,
    targetType,
    from,
    to,
  });

  if (query.isError) return <LoadState error={query.error} retry={() => void query.refetch()} />;

  const actionOptions = [
    { value: "", label: "Mọi hành động" },
    { value: "DISPUTE_RESOLVE", label: "Giải quyết tranh chấp" },
    { value: "PROVIDER_REJECT", label: "Từ chối nhà cung cấp" },
    { value: "PROVIDER_SUSPEND", label: "Tạm ngưng nhà cung cấp" },
    { value: "PROVIDER_VERIFY", label: "Xác minh nhà cung cấp" },
    { value: "PROVIDER_DOCUMENT_APPROVE", label: "Duyệt tài liệu nhà cung cấp" },
    { value: "PROVIDER_DOCUMENT_REJECT", label: "Từ chối tài liệu nhà cung cấp" },
    { value: "PROVIDER_WALLET_ADJUST", label: "Điều chỉnh số dư ví" },
    { value: "USER_STATUS_UPDATE", label: "Cập nhật trạng thái người dùng" },
    { value: "WITHDRAWAL_APPROVE", label: "Duyệt yêu cầu rút tiền" },
    { value: "WITHDRAWAL_MARK_PAID", label: "Đánh dấu đã chi trả" },
    { value: "WITHDRAWAL_REJECT", label: "Từ chối yêu cầu rút tiền" },
  ];

  const targetTypeOptions = [
    { value: "", label: "Mọi loại đối tượng" },
    { value: "BookingDispute", label: "Tranh chấp lịch hẹn" },
    { value: "Provider", label: "Nhà cung cấp" },
    { value: "ProviderWallet", label: "Ví nhà cung cấp" },
    { value: "User", label: "Người dùng" },
    { value: "WithdrawalRequest", label: "Yêu cầu rút tiền" },
    { value: "DISPUTE", label: "Tranh chấp (dữ liệu mới)" },
    { value: "PROVIDER", label: "Nhà cung cấp (dữ liệu mới)" },
    { value: "PROVIDER_DOCUMENT", label: "Tài liệu nhà cung cấp" },
    { value: "WITHDRAWAL", label: "Yêu cầu rút tiền (dữ liệu mới)" },
  ];

  return (
    <div className="space-y-5">
      <PageTitle title="Nhật ký quản trị" description="Dấu vết các thao tác nhạy cảm trên hệ thống." />
      <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <FilterSelect
            className="w-full sm:w-56"
            value={action}
            options={actionOptions}
            onChange={(v) => {
              setAction(v);
              setPage(1);
            }}
          />
          <FilterSelect
            className="w-full sm:w-56"
            value={targetType}
            options={targetTypeOptions}
            onChange={(v) => {
              setTargetType(v);
              setPage(1);
            }}
          />
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-muted shrink-0">Từ:</span>
            <input title="Từ ngày" type="datetime-local" className={inputClass} value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-muted shrink-0">Đến:</span>
            <input title="Đến ngày" type="datetime-local" className={inputClass} value={to} onChange={e => { setTo(e.target.value); setPage(1); }} />
          </div>
          <span className="text-sm font-medium text-muted ml-auto">
            {query.isFetching ? "Đang tải..." : `${query.data?.pagination.totalItems ?? 0} bản ghi`}
          </span>
        </div>
      </div>
      <AuditLogDataTable loading={query.isLoading} items={query.data?.items} />
      <Pager data={query.data} setPage={setPage} setPageSize={setPageSize} />
    </div>
  );
}
