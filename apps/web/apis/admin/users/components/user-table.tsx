"use client";

import { useRouter } from "next/navigation";
import { ActionMenu } from "@/components/ui/action-menu";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { Avatar } from "@/components/ui/avatar";
import { formatVietnameseDate } from "@/lib/date";
import { useAdminUserList } from "../hooks/use-admin-user-list";
import type { AdminUser, AdminUserRole, AdminUserStatus } from "../schema";
import {
  getUserDisplayName,
  roleFilterOptions,
  statusFilterOptions,
} from "../user-helpers";
import { RoleBadge, StatusBadge } from "./user-format";
import { UserFormDialog } from "./user-form-dialog";

export function UserTable() {
  const router = useRouter();
  const state = useAdminUserList();

  const columns: Array<DataTableColumn<AdminUser>> = [
    {
      key: "profile",
      header: "Hồ sơ",
      widthClassName: "w-[24%]",
      render: (user) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            src={user.avatar}
            alt={user.userName}
            fallback={user.userName.charAt(0).toUpperCase()}
            size="list"
            className="bg-blue-50 text-blue-700"
          />
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-gray-950">
              {getUserDisplayName(user)}
            </p>
            <p className="text-xs font-medium text-gray-500">@{user.userName}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Liên hệ",
      widthClassName: "w-[24%]",
      render: (user) => (
        <div className="min-w-0">
          <p className="break-words text-sm text-gray-900">{user.email}</p>
          <p className="text-xs text-gray-500">{user.phone}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Vai trò",
      widthClassName: "w-[14%]",
      render: (user) => <RoleBadge role={user.role} />,
    },
    {
      key: "joined",
      header: "Ngày tạo",
      widthClassName: "w-[14%]",
      render: (user) => (
        <span className="text-sm text-gray-700">
          {formatVietnameseDate(user.createAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      widthClassName: "w-[14%]",
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      isAction: true,
      widthClassName: "w-[10%]",
      render: (user) => (
        <ActionMenu
          items={[
            {
              label: "Xem tài khoản",
              onClick: () => router.push(`/admin/users/${user.id}`),
            },
            {
              label: "Chỉnh sửa",
              onClick: () => state.setEditingUser(user),
            },
            {
              label: "Ngừng hoạt động",
              onClick: () => void state.deactivateUser(user),
              variant: "danger",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        eyebrow="Quản trị / Tài khoản"
        title="Quản lý người dùng"
        description="Quản lý người tham gia nền tảng, vai trò, trạng thái truy cập và thông tin liên hệ."
        actions={
          <Button onClick={() => state.setIsCreateOpen(true)}>
            + Thêm người dùng
          </Button>
        }
      />

      <StatisticCardGrid columns={4}>
        <StatisticCard title="Tổng theo bộ lọc" value={state.total} tone="blue" />
        <StatisticCard
          title="Đang hoạt động"
          value={state.activeCount}
          tone="green"
        />
        <StatisticCard
          title="Nhà cung cấp"
          value={state.providerCount}
          tone="purple"
        />
        <StatisticCard title="Ngừng/Cấm" value={state.inactiveCount} tone="red" />
      </StatisticCardGrid>

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <SearchInput
            className="w-full xl:max-w-md"
            value={state.search}
            placeholder="Tìm theo tên đăng nhập"
            onChange={state.changeSearch}
          />
          <CustomSelect
            className="w-full sm:w-52"
            value={state.roleFilter}
            options={roleFilterOptions}
            onValueChange={(value) =>
              state.changeRoleFilter(value as "" | AdminUserRole)
            }
          />
          <CustomSelect
            className="w-full sm:w-52"
            value={state.statusFilter}
            options={statusFilterOptions}
            onValueChange={(value) =>
              state.changeStatusFilter(value as "" | AdminUserStatus)
            }
          />
          <div className="text-sm font-medium text-gray-500 xl:ml-auto">
            {state.usersQuery.isFetching
              ? "Đang tải..."
              : `${state.total} tài khoản`}
          </div>
        </div>
      </div>

      {state.usersQuery.isError ? (
        <div className="rounded-2xl border border-danger/20 bg-danger-soft p-6 text-sm font-semibold text-danger">
          Không thể tải danh sách người dùng. Vui lòng kiểm tra API hoặc quyền
          admin.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={state.records}
          getRowKey={(user) => user.id}
          minWidthClassName="min-w-[1040px]"
          emptyState={
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-gray-700">
                Không tìm thấy tài khoản
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Thử từ khóa, vai trò hoặc bộ lọc trạng thái khác.
              </p>
            </div>
          }
        />
      )}

      <Pagination
        page={state.page}
        totalPages={state.totalPages}
        onPageChange={state.setPage}
        pageSize={state.pageSize}
        pageSizeOptions={[10, 20, 50]}
        onPageSizeChange={state.changePageSize}
      />

      <UserFormDialog
        open={state.isCreateOpen}
        onClose={() => state.setIsCreateOpen(false)}
      />
      <UserFormDialog
        open={Boolean(state.editingUser)}
        user={state.editingUser}
        onClose={() => state.setEditingUser(undefined)}
      />
    </div>
  );
}
