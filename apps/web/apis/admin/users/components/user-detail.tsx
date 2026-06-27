"use client";

import Link from "next/link";
import { ActionMenu } from "@/components/ui/action-menu";
import { PageHeader } from "@/components/ui/page-header";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { formatVietnameseDateTime } from "@/lib/date";
import { useAdminUserDetail } from "../hooks/use-admin-user-detail";
import { roleLabels, statusLabels } from "../schema";
import { getUserDisplayName } from "../user-helpers";
import { UserFormDialog } from "./user-form-dialog";

export function UserDetail({ userId }: { userId: string }) {
  const state = useAdminUserDetail(userId);
  const account = state.user;

  if (state.userQuery.isLoading) {
    return (
      <div className="grid min-h-[420px] place-items-center text-sm font-semibold text-muted">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  if (!account) {
    return (
      <div className="w-full max-w-full space-y-6 p-6">
        <Link
          href="/admin/users"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Quay lại người dùng
        </Link>
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-700">
            Không tìm thấy tài khoản
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Tài khoản này có thể không tồn tại hoặc bạn không có quyền xem.
          </p>
        </div>
      </div>
    );
  }

  const detailItems = [
    ["Tên đăng nhập", account.userName],
    ["Họ tên", account.fullName ?? "Chưa cập nhật"],
    ["Email", account.email],
    ["Số điện thoại", account.phone],
    ["Vai trò", roleLabels[account.role]],
    ["Trạng thái", statusLabels[account.status]],
    ["Avatar", account.avatar ?? "Không có"],
    ["Cập nhật lần cuối", formatVietnameseDateTime(account.updateAt)],
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        backHref="/admin/users"
        backLabel="Quay lại người dùng"
        title={getUserDisplayName(account)}
        description={`${account.id} / ${roleLabels[account.role]}`}
        actions={
          <ActionMenu
            items={[
              {
                label: "Chỉnh sửa thông tin",
                onClick: () => state.setIsEditOpen(true),
              },
              {
                label: "Đổi thành khách hàng",
                onClick: () => void state.changeRole("CUSTOMER"),
              },
              {
                label: "Đổi thành nhà cung cấp",
                onClick: () => void state.changeRole("PROVIDER"),
              },
              {
                label: "Đổi thành quản trị viên",
                onClick: () => void state.changeRole("ADMIN"),
              },
              {
                label: "Ngừng hoạt động",
                onClick: () => void state.deactivateUser(),
                variant: "danger",
              },
            ]}
          />
        }
      />

      <StatisticCardGrid columns={3}>
        <StatisticCard
          title="Vai trò"
          value={roleLabels[account.role]}
          tone="blue"
        />
        <StatisticCard
          title="Trạng thái"
          value={statusLabels[account.status]}
          tone={account.status === "ACTIVE" ? "green" : "red"}
        />
        <StatisticCard
          title="Ngày tạo"
          value={formatVietnameseDateTime(account.createAt)}
          tone="purple"
          valueClassName="text-2xl"
        />
      </StatisticCardGrid>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-950">Chi tiết tài khoản</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {detailItems.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {label}
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <UserFormDialog
        open={state.isEditOpen}
        user={account}
        onClose={() => state.setIsEditOpen(false)}
      />
    </div>
  );
}
