"use client";

import { FormEvent } from "react";
import { useMyProviderInfo } from "@/apis/provider/verification/queries";
import { providerStatusLabels } from "@/apis/provider/verification/schema";
import { PageHeader } from "@/components/ui/page-header";
import { getAvatarInitials } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/feedback-provider";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { profileUpdateSchema } from "../schema";
import { useProfile } from "../queries";
import type { ProfileRouteRole } from "../schema";
import { AvatarUploader } from "./avatar-uploader";

const routeRoleLabels: Record<ProfileRouteRole, string> = {
  admin: "Quản trị viên",
  provider: "Nhà cung cấp",
};

const userRoleLabels: Record<string, string> = {
  ADMIN: "Quản trị viên",
  PROVIDER: "Nhà cung cấp",
  CUSTOMER: "Khách hàng",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
  BANNED: "Đã bị khóa",
};

const depositStatusLabels: Record<string, string> = {
  NOT_PAID: "Chưa ký quỹ",
  PENDING: "Đang xử lý",
  PAID: "Đã ký quỹ",
  REFUNDED: "Đã hoàn ký quỹ",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProfilePage({ role }: { role: ProfileRouteRole }) {
  const { showToast } = useToast();
  const { data: profile, isLoading, error } = useProfile();
  const providerQuery = useMyProviderInfo(role === "provider");

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = profileUpdateSchema.safeParse({
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
    });

    if (!result.success) {
      showToast(
        result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        "error",
      );
      return;
    }

    showToast(
      "BE hiện chưa có API cập nhật hồ sơ cá nhân. Màn này đang lấy dữ liệu từ /auth/get-info và /providers/me.",
      "info",
    );
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center p-6 text-sm font-semibold text-muted">
        Đang tải hồ sơ...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="grid min-h-[50vh] place-items-center p-6 text-sm font-semibold text-danger">
        Không thể tải hồ sơ tài khoản.
      </div>
    );
  }

  const provider = providerQuery.data;
  const displayName = profile.fullName || profile.userName;
  const avatar = profile.avatar;
  const initials = getAvatarInitials(displayName || profile.email);

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <form onSubmit={handleSave} className="space-y-6">
        <PageHeader
          eyebrow={`${routeRoleLabels[role]} / Hồ sơ`}
          title="Hồ sơ cá nhân"
          description={
            role === "provider"
              ? "Hồ sơ gồm thông tin tài khoản người dùng và thông tin riêng của nhà cung cấp."
              : "Hồ sơ quản trị viên chỉ hiển thị thông tin tài khoản cơ bản."
          }
          actions={
            <button
              type="submit"
              className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
            >
              Lưu thay đổi
            </button>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <AvatarUploader
                avatar={avatar}
                displayName={displayName}
                initials={initials}
              />
              <h2 className="mt-4 text-xl font-extrabold text-gray-950">
                {displayName}
              </h2>
              <p className="mt-1 text-sm font-medium text-gray-500">
                {profile.email}
              </p>
              <span className="mt-3 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {userRoleLabels[profile.role] ?? profile.role}
              </span>
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
              {[
                ["ID tài khoản", profile.id],
                ["Tên đăng nhập", profile.userName],
                ["Ngày tạo", formatDate(profile.createAt)],
                ["Cập nhật lần cuối", formatDate(profile.updateAt)],
              ].map(([label, value]) => (
                <InfoRow key={label} label={label} value={value} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <StatisticCardGrid columns={3}>
              <StatisticCard
                title="Vai trò"
                value={userRoleLabels[profile.role] ?? profile.role}
                tone="blue"
              />
              <StatisticCard
                title="Trạng thái tài khoản"
                value={statusLabels[profile.status] ?? profile.status}
                tone="green"
              />
              <StatisticCard
                title="Nguồn dữ liệu"
                value={role === "provider" ? "get-info + provider" : "get-info"}
                tone="purple"
              />
            </StatisticCardGrid>

            <UserProfileSection profile={profile} />

            {role === "provider" && (
              <ProviderProfileSection
                isLoading={providerQuery.isLoading}
                isError={Boolean(providerQuery.error)}
                provider={provider}
              />
            )}

            <AccountControls />
          </div>
        </div>
      </form>
    </div>
  );
}

function UserProfileSection({
  profile,
}: {
  profile: {
    fullName: string | null;
    userName: string;
    phone: string;
    email: string;
    role: string;
  };
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-950">
        Thông tin tài khoản
      </h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold text-gray-700">
          Họ và tên
          <input
            name="fullName"
            defaultValue={profile.fullName ?? profile.userName}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 outline-none transition-colors focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          />
        </label>
        <label className="space-y-1 text-sm font-semibold text-gray-700">
          Số điện thoại
          <input
            name="phone"
            defaultValue={profile.phone}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 outline-none transition-colors focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          />
        </label>
        <ReadOnlyField label="Email" value={profile.email} />
        <ReadOnlyField
          label="Vai trò"
          value={userRoleLabels[profile.role] ?? profile.role}
        />
      </div>
    </div>
  );
}

function ProviderProfileSection({
  isLoading,
  isError,
  provider,
}: {
  isLoading: boolean;
  isError: boolean;
  provider:
    | {
        id: string;
        businessName: string;
        slug: string;
        description: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        taxCode?: string | null;
        identityNumber?: string | null;
        identityFullName?: string | null;
        identityDob?: string | null;
        identityAddress?: string | null;
        bankCode?: string | null;
        bankAccountNumber?: string | null;
        bankAccountName?: string | null;
        providerStatus: string;
        depositStatus: string;
        depositBalance: number;
        walletBalance: number;
        cancellationRate: number;
        adminNote: string | null;
        createAt: string;
        updateAt: string;
      }
    | undefined;
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm font-semibold text-muted shadow-sm">
        Đang tải thông tin nhà cung cấp...
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <div className="rounded-2xl border border-warning/20 bg-warning-soft p-6 text-sm font-semibold text-warning shadow-sm">
        Chưa tìm thấy hồ sơ nhà cung cấp. Vui lòng hoàn tất đăng ký/xác minh nhà cung cấp.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatisticCardGrid columns={3}>
        <StatisticCard
          title="Trạng thái nhà cung cấp"
          value={
            providerStatusLabels[provider.providerStatus] ??
            provider.providerStatus
          }
          tone="green"
        />
        <StatisticCard
          title="Ví nhà cung cấp"
          value={formatCurrency(provider.walletBalance)}
          tone="blue"
        />
        <StatisticCard
          title="Tỷ lệ hủy"
          value={`${provider.cancellationRate}%`}
          tone="amber"
        />
      </StatisticCardGrid>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-950">
          Thông tin nhà cung cấp
        </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <ReadOnlyField label="Mã hồ sơ provider" value={provider.id} />
          <ReadOnlyField label="Slug" value={provider.slug} />
          <ReadOnlyField label="Tên cơ sở" value={provider.businessName} />
          <ReadOnlyField
            label="Email cơ sở"
            value={provider.email || "Chưa cung cấp"}
          />
          <ReadOnlyField
            label="Số điện thoại cơ sở"
            value={provider.phone || "Chưa cung cấp"}
          />
          <ReadOnlyField
            label="Mã số thuế"
            value={provider.taxCode || "Chưa cung cấp"}
          />
          <ReadOnlyField
            label="Số CCCD"
            value={provider.identityNumber || "Chưa cung cấp"}
          />
          <ReadOnlyField
            label="Họ tên trên CCCD"
            value={provider.identityFullName || "Chưa cung cấp"}
          />
          <ReadOnlyField
            label="Ngày sinh trên CCCD"
            value={provider.identityDob || "Chưa cung cấp"}
          />
          <ReadOnlyField
            label="Ngân hàng"
            value={provider.bankCode || "Chưa cung cấp"}
          />
          <ReadOnlyField
            label="Số tài khoản"
            value={provider.bankAccountNumber || "Chưa cung cấp"}
          />
          <ReadOnlyField
            label="Chủ tài khoản"
            value={provider.bankAccountName || "Chưa cung cấp"}
          />
          <ReadOnlyField
            label="Trạng thái ký quỹ"
            value={depositStatusLabels[provider.depositStatus] ?? provider.depositStatus}
          />
          <ReadOnlyField
            label="Số dư ký quỹ"
            value={formatCurrency(provider.depositBalance)}
          />
          <ReadOnlyField
            label="Ngày gửi hồ sơ"
            value={formatDate(provider.createAt)}
          />
          <label className="space-y-1 text-sm font-semibold text-gray-700 md:col-span-2">
            Địa chỉ trên CCCD
            <textarea
              value={provider.identityAddress || "Chưa cung cấp"}
              readOnly
              className="min-h-20 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium text-gray-500 outline-none"
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-gray-700 md:col-span-2">
            Địa chỉ cơ sở
            <textarea
              value={provider.address || "Chưa cung cấp"}
              readOnly
              className="min-h-20 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium text-gray-500 outline-none"
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-gray-700 md:col-span-2">
            Mô tả cơ sở
            <textarea
              value={provider.description || "Chưa cung cấp"}
              readOnly
              className="min-h-24 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium text-gray-500 outline-none"
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-gray-700 md:col-span-2">
            Ghi chú quản trị
            <textarea
              value={provider.adminNote || "Chưa có ghi chú từ quản trị viên."}
              readOnly
              className="min-h-20 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium text-gray-500 outline-none"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function AccountControls() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-950">
        Điều khiển tài khoản
      </h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {["Đổi mật khẩu", "Quản lý phiên đăng nhập", "Tùy chọn thông báo"].map(
          (label) => (
            <button
              key={label}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              {label}
            </button>
          ),
        )}
        <button className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700 transition-colors hover:bg-red-100">
          Đăng xuất khỏi mọi thiết bị
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-right text-sm font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="space-y-1 text-sm font-semibold text-gray-700">
      {label}
      <input
        value={value}
        readOnly
        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-500 outline-none"
      />
    </label>
  );
}
