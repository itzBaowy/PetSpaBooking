"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { getAvatarInitials } from "@/components/ui/avatar";
import { useConfirmDialog, useToast } from "@/components/ui";
import { ProviderDocumentPanel } from "@/apis/admin/providers/components/provider-document-panel";
import { textValue } from "@/apis/admin/supported-api";
import {
  LoadState,
  useAdminDetail,
  errorMessage,
  StatusPill,
  DetailItem,
} from "../shared";

export function AdminProviderDetailPage({
  id,
  backHref = "/admin/providers",
  backLabel = "Quay lại danh sách",
}: {
  id: string;
  backHref?: string;
  backLabel?: string;
}) {
  const client = useQueryClient();
  const query = useAdminDetail("provider", id ? API_ENDPOINTS.ADMIN.PROVIDERS.DETAIL(id) : null);
  const confirm = useConfirmDialog();
  const { showToast } = useToast();

  const mutate = useMutation({
    mutationFn: async ({ action, body }: { action: "verify" | "reject" | "suspend"; body?: object }) => {
      const url = action === "verify" ? API_ENDPOINTS.ADMIN.PROVIDERS.VERIFY(id)
        : action === "reject" ? API_ENDPOINTS.ADMIN.PROVIDERS.REJECT(id)
        : API_ENDPOINTS.ADMIN.PROVIDERS.SUSPEND(id);
      return (await api.patch<ApiResponse<unknown>>(url, body)).data.data;
    },
    onSuccess: () => void client.invalidateQueries({ queryKey: ["admin-real"] }),
  });

  if (query.isLoading) return <p>Đang tải...</p>;
  if (query.isError || !query.data) return <LoadState error={query.error ?? new Error("Không tìm thấy nhà cung cấp.")} retry={() => void query.refetch()} />;

  const verifyAction = async () => {
    const result = await confirm({
      title: "Xác minh nhà cung cấp",
      description: `Bạn có chắc chắn muốn xác minh nhà cung cấp ${query.data.businessName}?`,
      tone: "success",
      confirmLabel: "Xác minh",
      cancelLabel: "Hủy",
    });
    if (result.confirmed) {
      mutate.mutate(
        { action: "verify" },
        {
          onSuccess: () => showToast("Xác minh nhà cung cấp thành công.", "success"),
          onError: (e) => showToast(errorMessage(e), "error"),
        }
      );
    }
  };

  const reasonAction = async (action: "reject" | "suspend") => {
    const label = action === "reject" ? "Từ chối hồ sơ" : "Tạm ngưng nhà cung cấp";
    const result = await confirm({
      title: label,
      tone: action === "reject" ? "danger" : "default",
      input: {
        label: "Lý do thực hiện",
        placeholder: "Nhập lý do...",
        required: true,
      },
      confirmLabel: "Xác nhận",
      cancelLabel: "Hủy",
    });
    if (result.confirmed && result.value) {
      mutate.mutate(
        { action, body: { reason: result.value } },
        {
          onSuccess: () => showToast(`${label} thành công.`, "success"),
          onError: (e) => showToast(errorMessage(e), "error"),
        }
      );
    }
  };

  const p = query.data;
  const docs = Array.isArray(p.documents) ? p.documents : [];
  const initials = getAvatarInitials(textValue(p.businessName ?? p.fullName ?? p.userName));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href={backHref} className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors">
          &larr; {backLabel}
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-brand-soft/20 blur-2xl" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-brand text-2xl font-bold text-white shadow-md">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">{textValue(p.businessName)}</h2>
              <p className="text-sm text-muted">ID Nhà cung cấp: {id}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusPill value={p.providerStatus} />
                <StatusPill value={p.depositStatus} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="font-bold text-foreground">Thông tin cơ sở & liên hệ</h3>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="businessName" value={p.businessName} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            } />
            <DetailItem label="email" value={p.email} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            } />
            <DetailItem label="phone" value={p.phone} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            } />
            <DetailItem label="providerStatus" value={p.providerStatus} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } />
            <DetailItem label="createAt" value={p.createAt} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            } />
            <DetailItem label="updateAt" value={p.updateAt} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } />
          </dl>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-foreground">Tài chính & Ví</h3>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="walletBalance" value={p.walletBalance} icon={
              <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            } />
            <DetailItem label="depositBalance" value={p.depositBalance} icon={
              <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            } />
            <DetailItem label="depositStatus" value={p.depositStatus} icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            } />
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground">Hành động quản trị</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={verifyAction} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm">
            Xác minh
          </Button>
          <Button onClick={() => reasonAction("reject")} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-sm">
            Từ chối
          </Button>
          <Button onClick={() => reasonAction("suspend")} className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm">
            Tạm ngưng
          </Button>
          <Link href={`/admin/providers/${id}/balance`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold border border-border-muted bg-surface text-foreground hover:bg-surface-muted transition shadow-sm">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ví & ký quỹ
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-foreground">Tài liệu xác thực ({docs.length})</h2>
        <ProviderDocumentPanel
          documents={docs as any}
          providerStatus={p.providerStatus as any}
        />
      </section>
    </div>
  );
}
