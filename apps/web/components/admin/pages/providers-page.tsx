"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { Button } from "@/components/ui/button";
import {
  PageTitle,
  LoadState,
  useAdminList,
  FilterSelect,
  EntityTable,
  Pager,
} from "../shared";

export function AdminProvidersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);

  const url = pendingOnly
    ? API_ENDPOINTS.ADMIN.PROVIDERS.PENDING
    : API_ENDPOINTS.ADMIN.PROVIDERS.LIST;

  const query = useAdminList("providers", url, {
    page,
    pageSize,
    providerStatus: status,
  });

  if (query.isError) return <LoadState error={query.error} retry={() => void query.refetch()} />;

  return (
    <div className="w-full max-w-full space-y-6">
      <PageTitle title="Quản lý nhà cung cấp" description="Quản lý hồ sơ, tài liệu, số dư và trạng thái xác minh." />
      <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <Button
            variant={pendingOnly ? "default" : "outline"}
            onClick={() => {
              setPendingOnly((value) => !value);
              setPage(1);
            }}
          >
            {pendingOnly ? "Đang xem hồ sơ chờ duyệt" : "Chỉ xem hồ sơ chờ duyệt"}
          </Button>
          <FilterSelect
            className="w-full sm:w-56"
            value={status}
            options={[
              { value: "", label: "Mọi trạng thái" },
              { value: "PENDING_VERIFICATION", label: "Chờ xác minh" },
              { value: "VERIFIED", label: "Đã xác minh" },
              { value: "REJECTED", label: "Đã từ chối" },
              { value: "SUSPENDED", label: "Tạm ngưng" },
            ]}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          <span className="w-full text-sm font-medium text-muted xl:ml-auto xl:w-auto">
            {query.isFetching ? "Đang tải..." : `${query.data?.pagination.totalItems ?? 0} nhà cung cấp`}
          </span>
        </div>
      </div>
      <EntityTable
        loading={query.isLoading}
        items={query.data?.items}
        columns={["businessName", "email", "phone", "providerStatus", "depositStatus", "walletBalance"]}
        detailBase="/admin/providers"
      />
      <Pager data={query.data} setPage={setPage} setPageSize={setPageSize} />
    </div>
  );
}
