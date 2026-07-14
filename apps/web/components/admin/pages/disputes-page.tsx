"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  PageTitle,
  LoadState,
  useAdminList,
  FilterSelect,
  EntityTable,
  Pager,
} from "../shared";

export function AdminDisputesPage() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState(searchParams.get("status") ?? "");

  const query = useAdminList("disputes", API_ENDPOINTS.ADMIN.DISPUTES.LIST, {
    page,
    pageSize,
    status,
  });

  if (query.isError) return <LoadState error={query.error} retry={() => void query.refetch()} />;

  return (
    <div className="space-y-5">
      <PageTitle title="Tranh chấp" description="Xử lý khiếu nại đang chờ và các tranh chấp đã có kết quả." />
      <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            className="w-full sm:w-64"
            value={status}
            options={[
              { value: "", label: "Mọi trạng thái" },
              { value: "PENDING", label: "Đang chờ xử lý" },
              { value: "RESOLVED_PROVIDER_WIN", label: "Nhà cung cấp thắng" },
              { value: "RESOLVED_CUSTOMER_WIN", label: "Khách hàng thắng" },
              { value: "CANCELLED", label: "Đã hủy" },
            ]}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          <span className="w-full text-sm font-medium text-muted sm:ml-auto sm:w-auto">
            {query.isFetching ? "Đang tải..." : `${query.data?.pagination.totalItems ?? 0} tranh chấp`}
          </span>
        </div>
      </div>
      <EntityTable
        loading={query.isLoading}
        items={query.data?.items}
        columns={["bookingId", "reason", "status", "createdAt"]}
        detailBase="/admin/bookings/disputes"
      />
      <Pager data={query.data} setPage={setPage} setPageSize={setPageSize} />
    </div>
  );
}
