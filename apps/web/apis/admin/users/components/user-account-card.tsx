"use client";

import { Avatar, getAvatarInitials } from "@/components/ui/avatar";
import { formatVietnameseDateTime } from "@/lib/date";
import type { AdminUser } from "../schema";
import { roleLabels, statusLabels } from "../schema";
import { getUserDisplayName } from "../user-helpers";

export function UserAccountCard({ user }: { user: AdminUser }) {
  const displayName = getUserDisplayName(user);
  const detailItems = [
    ["Tên đăng nhập", user.userName],
    ["Họ tên", user.fullName ?? "Chưa cập nhật"],
    ["Email", user.email],
    ["Số điện thoại", user.phone],
    ["Vai trò", roleLabels[user.role]],
    ["Trạng thái", statusLabels[user.status]],
    ["Địa chỉ", user.customers?.location ?? "Chưa cập nhật"],
    ["Cập nhật lần cuối", formatVietnameseDateTime(user.updateAt)],
  ];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center text-center">
        <Avatar
          src={user.avatar}
          alt={displayName}
          fallback={getAvatarInitials(displayName)}
          size="profile"
          className="h-32 w-32 text-3xl"
        />
        <h2 className="mt-4 text-xl font-bold text-gray-950">{displayName}</h2>
        <p className="mt-1 max-w-full break-all text-xs font-semibold text-gray-500">
          {user.id}
        </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
    </section>
  );
}
