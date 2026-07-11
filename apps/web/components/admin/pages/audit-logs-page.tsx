"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  PageTitle,
  LoadState,
  useAdminList,
  EntityTable,
  Pager,
  inputClass,
} from "../shared";

export function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [adminId, setAdminId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const query = useAdminList("audit", API_ENDPOINTS.ADMIN.AUDIT_LOGS, {
    page,
    pageSize,
    action,
    targetType,
    adminId,
    targetId,
    from,
    to,
  });

  if (query.isError) return <LoadState error={query.error} retry={() => void query.refetch()} />;

  return (
    <div className="space-y-5">
      <PageTitle title="Nhật ký quản trị" description="Dấu vết các thao tác nhạy cảm trên hệ thống." />
      <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <input className={inputClass} placeholder="Mã quản trị viên" value={adminId} onChange={e => setAdminId(e.target.value)} />
          <input className={inputClass} placeholder="Hành động" value={action} onChange={e => setAction(e.target.value)} />
          <input className={inputClass} placeholder="Loại đối tượng" value={targetType} onChange={e => setTargetType(e.target.value)} />
          <input className={inputClass} placeholder="Mã đối tượng" value={targetId} onChange={e => setTargetId(e.target.value)} />
          <input title="Từ ngày" type="datetime-local" className={inputClass} value={from} onChange={e => setFrom(e.target.value)} />
          <input title="Đến ngày" type="datetime-local" className={inputClass} value={to} onChange={e => setTo(e.target.value)} />
          <span className="text-sm font-medium text-muted self-center ml-auto">
            {query.isFetching ? "Đang tải..." : `${query.data?.pagination.totalItems ?? 0} bản ghi`}
          </span>
        </div>
      </div>
      <EntityTable loading={query.isLoading} items={query.data?.items} columns={["action", "targetType", "targetId", "createAt"]} />
      <Pager data={query.data} setPage={setPage} setPageSize={setPageSize} />
    </div>
  );
}
