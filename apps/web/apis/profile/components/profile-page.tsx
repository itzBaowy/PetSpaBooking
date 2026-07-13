"use client";

import { FormEvent, useState } from "react";
import { useMyProviderInfo } from "@/apis/provider/verification/queries";
import { getAvatarInitials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/feedback-provider";
import { providerDate, providerMoney } from "@/apis/provider/_shared/provider-ui";
import { useChangePassword, useProfile } from "../queries";
import type { ProfileRouteRole } from "../schema";
import { AvatarUploader } from "./avatar-uploader";

const routeRoleLabels: Record<ProfileRouteRole, string> = {
  admin: "Quản trị viên",
  provider: "Nhà cung cấp",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị viên",
  PROVIDER: "Nhà cung cấp",
  CUSTOMER: "Khách hàng",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
  BANNED: "Đã bị khóa",
};

export function ProfilePage({ role }: { role: ProfileRouteRole }) {
  const { data: profile, isLoading, error } = useProfile();
  const providerQuery = useMyProviderInfo(role === "provider");

  if (isLoading) {
    return <div className="grid min-h-[50vh] place-items-center p-6 text-sm font-semibold text-muted">Đang tải hồ sơ...</div>;
  }

  if (error || !profile) {
    return <div className="grid min-h-[50vh] place-items-center p-6 text-sm font-semibold text-danger">Không thể tải hồ sơ tài khoản.</div>;
  }

  const displayName = profile.fullName || profile.userName;
  const initials = getAvatarInitials(displayName || profile.email);

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <header className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
        <p className="text-xs font-extrabold uppercase text-brand">{routeRoleLabels[role]} / Hồ sơ</p>
        <h1 className="mt-2 text-3xl font-black">Hồ sơ cá nhân</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Quản lý thông tin tài khoản, avatar và mật khẩu đăng nhập.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-border-subtle bg-surface p-6 text-center shadow-sm">
          <AvatarUploader avatar={profile.avatar} displayName={displayName} initials={initials} />
          <h2 className="mt-4 text-xl font-extrabold">{displayName}</h2>
          <p className="mt-1 text-sm text-muted">{profile.email}</p>
          <span className="mt-3 inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
            {roleLabels[profile.role] ?? profile.role}
          </span>
          <dl className="mt-6 space-y-3 border-t border-border-subtle pt-5 text-left">
            <InfoRow label="ID tài khoản" value={profile.id} />
            <InfoRow label="Tên đăng nhập" value={profile.userName} />
            <InfoRow label="Ngày tạo" value={providerDate(profile.createAt)} />
            <InfoRow label="Cập nhật lần cuối" value={providerDate(profile.updateAt)} />
          </dl>
        </section>

        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            <Metric label="Vai trò" value={roleLabels[profile.role] ?? profile.role} />
            <Metric label="Trạng thái tài khoản" value={statusLabels[profile.status] ?? profile.status} />
          </section>

          <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-extrabold">Thông tin tài khoản</h2>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoBlock label="Họ và tên" value={profile.fullName ?? profile.userName} />
              <InfoBlock label="Số điện thoại" value={profile.phone || "Chưa cung cấp"} />
              <InfoBlock label="Email" value={profile.email} />
              <InfoBlock label="Vai trò" value={roleLabels[profile.role] ?? profile.role} />
            </dl>
          </section>

          {role === "provider" ? (
            <ProviderProfileSummary
              isLoading={providerQuery.isLoading}
              isError={Boolean(providerQuery.error)}
              provider={providerQuery.data}
            />
          ) : null}

          <ChangePasswordPanel />
        </div>
      </div>
    </div>
  );
}

function ProviderProfileSummary({
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
        providerStatus: string;
        depositStatus: string;
        depositBalance: number;
        walletBalance: number;
        address: string | null;
        adminNote: string | null;
      }
    | undefined;
}) {
  if (isLoading) {
    return <section className="rounded-2xl border border-border-subtle bg-surface p-5 text-sm font-semibold text-muted shadow-sm">Đang tải thông tin nhà cung cấp...</section>;
  }
  if (isError || !provider) {
    return <section className="rounded-2xl border border-warning/25 bg-warning-soft p-5 text-sm font-semibold text-warning shadow-sm">Chưa tìm thấy hồ sơ nhà cung cấp.</section>;
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-extrabold">Thông tin nhà cung cấp</h2>
      <dl className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoBlock label="Tên cơ sở" value={provider.businessName} />
        <InfoBlock label="Trạng thái hồ sơ" value={provider.providerStatus.replaceAll("_", " ")} />
        <InfoBlock label="Trạng thái ký quỹ" value={provider.depositStatus.replaceAll("_", " ")} />
        <InfoBlock label="Số dư ký quỹ" value={providerMoney.format(provider.depositBalance)} />
        <InfoBlock label="Số dư ví" value={providerMoney.format(provider.walletBalance)} />
        <InfoBlock label="Địa chỉ" value={provider.address ?? "Chưa cung cấp"} />
        {provider.adminNote ? <InfoBlock label="Ghi chú admin" value={provider.adminNote} /> : null}
      </dl>
    </section>
  );
}

function ChangePasswordPanel() {
  const changePassword = useChangePassword();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const invalid = newPassword.length < 6 || newPassword !== confirmPassword || !currentPassword;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (invalid) {
      showToast("Vui lòng kiểm tra mật khẩu hiện tại và xác nhận mật khẩu mới.", "error");
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          showToast("Đã đổi mật khẩu.", "success");
        },
        onError: () => showToast("Không thể đổi mật khẩu. Vui lòng thử lại.", "error"),
      },
    );
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-extrabold">Đổi mật khẩu</h2>
      <form className="mt-5 grid gap-4 md:grid-cols-3" onSubmit={submit}>
        <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Mật khẩu hiện tại" autoComplete="current-password" />
        <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Mật khẩu mới" autoComplete="new-password" />
        <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" />
        <div className="md:col-span-3">
          <Button disabled={invalid || changePassword.isLoading} type="submit">
            {changePassword.isLoading ? "Đang đổi..." : "Đổi mật khẩu"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-extrabold uppercase text-subtle">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="break-all text-right font-semibold">{value}</dd>
    </div>
  );
}
