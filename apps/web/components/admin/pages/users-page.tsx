"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { SearchInput } from "@/components/ui/search-input";
import {
  PageTitle,
  LoadState,
  useAdminList,
  FilterSelect,
  EntityTable,
  Pager,
} from "../shared";

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const query = useAdminList("users", API_ENDPOINTS.ADMIN.USERS.LIST, {
    page,
    pageSize,
    keyword,
    role,
    status,
  });

  if (query.isError) return <LoadState error={query.error} retry={() => void query.refetch()} />;

  return (
    <div className="w-full max-w-full space-y-6">
      <PageTitle title="Quản lý người dùng" description="Tìm kiếm, lọc và quản lý trạng thái tài khoản." />
      <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <SearchInput
            className="w-full xl:max-w-md"
            value={keyword}
            placeholder="Tìm theo tên, email hoặc số điện thoại"
            onChange={(value) => {
              setKeyword(value);
              setPage(1);
            }}
          />
          <FilterSelect
            className="w-full sm:w-52"
            value={role}
            options={[
              { value: "", label: "Mọi vai trò" },
              { value: "CUSTOMER", label: "Khách hàng" },
              { value: "PROVIDER", label: "Nhà cung cấp" },
              { value: "ADMIN", label: "Quản trị viên" },
            ]}
            onChange={(value) => {
              setRole(value);
              setPage(1);
            }}
          />
          <FilterSelect
            className="w-full sm:w-52"
            value={status}
            options={[
              { value: "", label: "Mọi trạng thái" },
              { value: "ACTIVE", label: "Đang hoạt động" },
              { value: "INACTIVE", label: "Ngừng hoạt động" },
              { value: "BANNED", label: "Bị cấm" },
            ]}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          <span className="text-sm font-medium text-muted xl:ml-auto">
            {query.isFetching ? "Đang tải..." : `${query.data?.pagination.totalItems ?? 0} tài khoản`}
          </span>
        </div>
      </div>
      <EntityTable
        loading={query.isLoading}
        items={query.data?.items}
        columns={["userName", "fullName", "email", "role", "status"]}
        detailBase="/admin/users"
      />
      <Pager data={query.data} setPage={setPage} setPageSize={setPageSize} />
    </div>
  );
}
