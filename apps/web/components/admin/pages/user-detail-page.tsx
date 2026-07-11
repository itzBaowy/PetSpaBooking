"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/apis/auth/queries";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { getAvatarInitials } from "@/components/ui/avatar";
import { useConfirmDialog, useToast } from "@/components/ui";
import { UserPetsPanel } from "@/apis/admin/users/components/user-pets-panel";
import { textValue, nested } from "@/apis/admin/supported-api";
import {
  LoadState,
  useAdminDetail,
  VALUE_LABELS,
  displayValue,
  errorMessage,
  StatusPill,
  DetailItem,
} from "../shared";
import { AdminProviderDetailPage } from "./provider-detail-page";

export function AdminUserDetailPage({ id }: { id: string }) {
  const profile = useProfile();
  const client = useQueryClient();
  const query = useAdminDetail("user", id ? API_ENDPOINTS.ADMIN.USERS.DETAIL(id) : null);
  const confirm = useConfirmDialog();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: async (payload: { status: string; reason: string }) =>
      (await api.patch<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.USERS.STATUS(id), payload)).data.data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin-real"] });
    },
  });

  if (!id) return <LoadState error={new Error("ID người dùng không hợp lệ.")} retry={() => {}} />;
  if (query.isLoading) return <p>Đang tải...</p>;
  if (query.isError || !query.data) return <LoadState error={query.error ?? new Error("Không tìm thấy người dùng.")} retry={() => void query.refetch()} />;

  const update = async (status: string) => {
    if (profile.data?.id === id) {
      showToast("Không thể thay đổi trạng thái chính tài khoản đang đăng nhập.", "error");
      return;
    }
    const result = await confirm({
      title: `Chuyển trạng thái sang ${VALUE_LABELS[status] ?? status}`,
      tone: status === "BANNED" ? "danger" : "default",
      input: {
        label: "Lý do chuyển trạng thái",
        placeholder: "Nhập lý do...",
        required: true,
      },
      confirmLabel: "Xác nhận",
      cancelLabel: "Hủy",
    });
    if (result.confirmed && result.value) {
      mutation.mutate(
        { status, reason: result.value },
        {
          onSuccess: () => showToast("Cập nhật trạng thái thành công.", "success"),
          onError: (e) => showToast(errorMessage(e), "error"),
        }
      );
    }
  };

  const u = query.data;
  const initials = getAvatarInitials(textValue(u.fullName ?? u.userName));

  // If user role is PROVIDER and provider profile exists, show provider detail view
  const providerId = textValue(nested(u, "provider", "id"), "");
  if (textValue(u.role) === "PROVIDER" && providerId) {
    return (
      <AdminProviderDetailPage
        id={providerId}
        backHref="/admin/users"
        backLabel="Quay lại danh sách người dùng"
      />
    );
  }

  // If user role is ADMIN, display like user profile page
  if (textValue(u.role) === "ADMIN") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/users" className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors">
            &larr; Quay lại danh sách người dùng
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-hover text-4xl font-bold text-white shadow-md">
              {initials}
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-foreground">{textValue(u.fullName ?? u.userName)}</h2>
            <p className="mt-1 text-sm font-medium text-muted">{textValue(u.email)}</p>
            <span className="mt-3 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              Quản trị viên
            </span>
            <div className="mt-6 w-full space-y-3 border-t border-border-subtle pt-5 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-muted">ID tài khoản</span>
                <span className="font-semibold text-foreground">{id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tên đăng nhập</span>
                <span className="font-semibold text-foreground">{textValue(u.userName)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Ngày tạo</span>
                <span className="font-semibold text-foreground">{displayValue(u.createAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Cập nhật lần cuối</span>
                <span className="font-semibold text-foreground">{displayValue(u.updateAt)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-foreground">Thông tin tài khoản quản trị</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="userName" value={u.userName} icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                } />
                <DetailItem label="fullName" value={u.fullName} icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                } />
                <DetailItem label="email" value={u.email} icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                } />
                <DetailItem label="phone" value={u.phone} icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                } />
              </div>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-foreground">Hành động quản trị</h3>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => update("ACTIVE")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm">
                  Kích hoạt
                </Button>
                <Button onClick={() => update("INACTIVE")} className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm">
                  Ngừng hoạt động
                </Button>
                <Button onClick={() => update("BANNED")} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-sm">
                  Cấm tài khoản
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default display (e.g. CUSTOMER)
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/users" className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors">
          &larr; Quay lại danh sách
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-brand-soft/20 blur-2xl" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-hover text-2xl font-bold text-white shadow-md">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">{textValue(u.fullName ?? u.userName)}</h2>
              <p className="text-sm text-muted">ID: {id}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusPill value={u.role} />
                <StatusPill value={u.status} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v1m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v1" />
            </svg>
            <h3 className="font-bold text-foreground">Thông tin tài khoản</h3>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="userName" value={u.userName} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            } />
            <DetailItem label="fullName" value={u.fullName} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            } />
            <DetailItem label="role" value={u.role} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            } />
            <DetailItem label="status" value={u.status} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } />
            <DetailItem label="createAt" value={u.createAt} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            } />
            <DetailItem label="updateAt" value={u.updateAt} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } />
          </dl>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="font-bold text-foreground">Thông tin liên hệ</h3>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="email" value={u.email} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            } />
            <DetailItem label="phone" value={u.phone} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            } />
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground">Hành động quản trị</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => update("ACTIVE")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm">
            Kích hoạt
          </Button>
          <Button onClick={() => update("INACTIVE")} className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm">
            Ngừng hoạt động
          </Button>
          <Button onClick={() => update("BANNED")} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-sm">
            Cấm tài khoản
          </Button>
        </div>
      </div>

      {textValue(u.role) === "CUSTOMER" && (
        <div className="mt-6 border-t border-border-subtle pt-6">
          <UserPetsPanel user={u as any} />
        </div>
      )}
    </div>
  );
}
