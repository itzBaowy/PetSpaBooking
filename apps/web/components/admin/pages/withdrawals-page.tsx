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
  displayValue,
} from "../shared";
import { nested, textValue } from "@/apis/admin/supported-api";

export function AdminWithdrawalsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("");

  const query = useAdminList("withdrawals", API_ENDPOINTS.ADMIN.WITHDRAWALS.LIST, {
    page,
    pageSize,
    status,
  });

  if (query.isError) return <LoadState error={query.error} retry={() => void query.refetch()} />;

  return (
    <div className="space-y-5">
      <PageTitle title="Yêu cầu rút tiền" description="Duyệt, từ chối và xác nhận đã thanh toán theo trạng thái." />
      <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            className="w-full sm:w-56"
            value={status}
            options={[
              { value: "", label: "Mọi trạng thái" },
              { value: "PENDING", label: "Đang chờ" },
              { value: "APPROVED", label: "Đã duyệt" },
              { value: "REJECTED", label: "Đã từ chối" },
              { value: "PAID", label: "Đã chi trả" },
            ]}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          />
          <span className="w-full text-sm font-medium text-muted sm:ml-auto sm:w-auto">
            {query.isFetching ? "Đang tải..." : `${query.data?.pagination.totalItems ?? 0} yêu cầu`}
          </span>
        </div>
      </div>
      <EntityTable
        loading={query.isLoading}
        items={query.data?.items}
        columns={["provider.businessName", "amount", "status", "reason", "createAt"]}
        detailBase="/admin/finance/withdrawals"
        renderers={{
          "provider.businessName": (item) => (
            <div className="min-w-0">
              <p className="break-words font-semibold text-foreground">
                {textValue(nested(item, "provider", "businessName"))}
              </p>
              <p className="mt-1 break-all text-xs font-medium text-muted">
                {displayValue(item.providerId, "providerId")}
              </p>
            </div>
          ),
        }}
      />
      <Pager data={query.data} setPage={setPage} setPageSize={setPageSize} />
    </div>
  );
}
