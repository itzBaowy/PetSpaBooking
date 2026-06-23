"use client";

import Link from "next/link";
import { ActionMenu } from "@/components/ui/action-menu";
import { PageHeader } from "@/components/ui/page-header";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { accountStatusActionSchema } from "../schema";
import type { AdminAccountStatus } from "../schema";
import { useAdminUsers } from "../queries";
import type { AdminUserAccount } from "../queries";

const roleLabels = {
  PET_OWNER: "Chủ thú cưng",
  SERVICE_PROVIDER: "Nhà cung cấp",
  ADMIN: "Quản trị viên",
};

const statusLabels: Record<AdminAccountStatus, string> = {
  ACTIVE: "Đang hoạt động",
  SUSPENDED: "Tạm khóa",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function handleStatusAction(account: AdminUserAccount) {
  const nextStatus: AdminAccountStatus =
    account.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  const reason = window.prompt(
    nextStatus === "ACTIVE"
      ? "Nhập lý do mở khóa tài khoản:"
      : "Nhập lý do tạm khóa tài khoản:",
  );

  if (!reason) return;

  const result = accountStatusActionSchema.safeParse({
    accountId: account.id,
    role: account.role,
    status: nextStatus,
    reason,
    durationType: "PERMANENT",
  });

  if (!result.success) {
    window.alert(result.error.issues[0]?.message ?? "Thao tác trạng thái không hợp lệ.");
    return;
  }

  window.alert(
    `Trạng thái của ${account.name} sẽ đổi thành ${statusLabels[nextStatus]} (mock).`,
  );
}

export function UserDetail({ userId }: { userId: string }) {
  const { data: accounts } = useAdminUsers();
  const account = accounts.find((item) => item.id === userId);

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
            Tài khoản mock này có thể chưa tồn tại trong bộ dữ liệu hiện tại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        backHref="/admin/users"
        backLabel="Quay lại người dùng"
        title={account.name}
        description={`${account.id} / ${roleLabels[account.role]}`}
        actions={
          <ActionMenu
            items={[
              {
                label:
                  account.status === "ACTIVE"
                    ? "Tạm khóa tài khoản"
                    : "Mở khóa tài khoản",
                onClick: () => handleStatusAction(account),
                variant: account.status === "ACTIVE" ? "danger" : "default",
              },
            ]}
          />
        }
      />

      <StatisticCardGrid columns={3}>
        <StatisticCard title="Đặt lịch" value={account.bookings} tone="blue" />
        <StatisticCard
          title="Giá trị theo dõi"
          value={formatCurrency(account.totalSpendVnd)}
          tone="green"
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Trạng thái"
          value={statusLabels[account.status]}
          tone={account.status === "ACTIVE" ? "green" : "red"}
        />
      </StatisticCardGrid>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-950">Chi tiết tài khoản</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            ["Email", account.email],
            ["Số điện thoại", account.phone],
            ["Vai trò", roleLabels[account.role]],
            ["Ngày tham gia", formatDate(account.joinedAt)],
            ["Lý do khóa", account.banReason ?? "Không có"],
            ["Hết hạn khóa", account.banExpiresAt ?? "Chưa đặt"],
          ].map(([label, value]) => (
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
    </div>
  );
}
