"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useAdminUsers,
  useDeactivateAdminUser,
} from "../queries";
import type { AdminUser, AdminUserRole, AdminUserStatus } from "../schema";
import { getDeactivateConfirmMessage } from "../user-helpers";

export function useAdminUserList() {
  const deactivateMutation = useDeactivateAdminUser();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | AdminUserRole>("");
  const [statusFilter, setStatusFilter] = useState<"" | AdminUserStatus>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | undefined>();
  const debouncedSearch = useDebounce(search, 350);

  const usersQuery = useAdminUsers({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
  });

  const records = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.totalItem ?? 0;
  const totalPages = Math.max(usersQuery.data?.totalPage ?? 1, 1);
  const activeCount = records.filter((user) => user.status === "ACTIVE").length;
  const inactiveCount = records.filter(
    (user) => user.status !== "ACTIVE",
  ).length;
  const providerCount = records.filter((user) => user.role === "PROVIDER").length;

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeRoleFilter(value: "" | AdminUserRole) {
    setRoleFilter(value);
    setPage(1);
  }

  function changeStatusFilter(value: "" | AdminUserStatus) {
    setStatusFilter(value);
    setPage(1);
  }

  function changePageSize(value: number) {
    setPageSize(value);
    setPage(1);
  }

  async function deactivateUser(user: AdminUser) {
    const confirmed = window.confirm(getDeactivateConfirmMessage(user));
    if (!confirmed) return;

    await deactivateMutation.mutateAsync(user.id);
  }

  return {
    usersQuery,
    records,
    total,
    totalPages,
    activeCount,
    inactiveCount,
    providerCount,
    search,
    roleFilter,
    statusFilter,
    page,
    pageSize,
    isCreateOpen,
    editingUser,
    setPage,
    setIsCreateOpen,
    setEditingUser,
    changeSearch,
    changeRoleFilter,
    changeStatusFilter,
    changePageSize,
    deactivateUser,
  };
}
