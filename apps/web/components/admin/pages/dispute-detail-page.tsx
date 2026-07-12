"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { useConfirmDialog, useToast } from "@/components/ui";
import { textValue } from "@/apis/admin/supported-api";
import {
  LoadState,
  useAdminDetail,
  EntityFields,
  StatusPill,
  errorMessage,
} from "../shared";

export function AdminDisputeDetailPage({ id }: { id: string }) {
  const client = useQueryClient();
  const query = useAdminDetail("dispute", id ? API_ENDPOINTS.ADMIN.DISPUTES.DETAIL(id) : null);
  const confirm = useConfirmDialog();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: async (payload: { status: string; adminNote?: string }) =>
      (await api.patch<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.DISPUTES.RESOLVE(id), payload)).data.data,
    onSuccess: () => void client.invalidateQueries({ queryKey: ["admin-real"] }),
  });

  if (query.isLoading) return <p>Đang tải...</p>;
  if (query.isError || !query.data) return <LoadState error={query.error ?? new Error("Không tìm thấy tranh chấp.")} retry={() => void query.refetch()} />;

  const resolve = async (status: string) => {
    const result = await confirm({
      title: "Giải quyết tranh chấp",
      description: "Ghi chú xử lý (có thể bỏ trống):",
      input: { label: "Ghi chú admin", placeholder: "Nhập ghi chú...", required: false },
    });
    if (result.confirmed) {
      mutation.mutate(
        { status, ...(result.value ? { adminNote: result.value } : {}) },
        { onSuccess: () => showToast("Đã giải quyết tranh chấp.", "success"), onError: (e) => showToast(errorMessage(e), "error") }
      );
    }
  };

  const d = query.data;
  const isPending = textValue(d.status) === "PENDING";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/bookings/disputes" className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors">
          &larr; Quay lại danh sách tranh chấp
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-brand-soft/20 blur-2xl" />
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-md">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Tranh chấp #{textValue(id).slice(-8).toUpperCase()}</h2>
            <p className="text-sm text-muted">Booking: {textValue(d.bookingId)}</p>
            <div className="mt-2 flex flex-wrap gap-2"><StatusPill value={d.status} /></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-foreground">Thông tin tranh chấp</h3>
          </div>
          <EntityFields entity={d} omit={["booking"]} />
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
            <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="font-bold text-amber-800">Chính sách giải quyết</h3>
          </div>
          <ul className="space-y-2 text-sm text-amber-900">
            <li><span className="font-bold text-emerald-700">NCC thắng / Hủy khiếu nại:</span> Lịch đặt hoàn tất, tính hoa hồng.</li>
            <li><span className="font-bold text-blue-700">KH thắng:</span> Lịch đặt bị hủy, không tính hoa hồng.</li>
          </ul>
        </div>
      </div>

      {isPending && (
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-foreground">Hành động xử lý</h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => resolve("RESOLVED_PROVIDER_WIN")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm">Nhà cung cấp thắng</Button>
            <Button onClick={() => resolve("RESOLVED_CUSTOMER_WIN")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm">Khách hàng thắng</Button>
            <Button onClick={() => resolve("CANCELLED")} className="bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-all shadow-sm">Hủy khiếu nại</Button>
          </div>
        </div>
      )}
    </div>
  );
}
