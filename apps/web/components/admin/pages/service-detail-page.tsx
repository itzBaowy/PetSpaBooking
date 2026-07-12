"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useConfirmDialog, useToast } from "@/components/ui";
import type { ApiResponse } from "@/types/api";
import {
  DetailItem,
  EntityFields,
  LoadState,
  StatusPill,
  errorMessage,
  useAdminDetail,
} from "../shared";

export function AdminServiceDetailPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const confirm = useConfirmDialog();
  const { showToast } = useToast();
  const query = useAdminDetail(
    "service",
    id ? API_ENDPOINTS.ADMIN.SERVICES.DETAIL(id) : null,
  );

  const mutation = useMutation({
    mutationFn: async ({ hidden, reason }: { hidden: boolean; reason?: string }) => {
      const url = hidden
        ? API_ENDPOINTS.ADMIN.SERVICES.UNHIDE(id)
        : API_ENDPOINTS.ADMIN.SERVICES.HIDE(id);
      return (await api.patch<ApiResponse<unknown>>(url, !hidden && reason ? { reason } : undefined)).data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-real"] });
    },
  });

  if (query.isLoading) return <p>Đang tải dịch vụ...</p>;
  if (query.isError || !query.data) {
    return (
      <LoadState
        error={query.error ?? new Error("Không tìm thấy dịch vụ.")}
        retry={() => void query.refetch()}
      />
    );
  }

  const service = query.data;
  const hidden = service.isHiddenByAdmin === true;
  const provider =
    service.provider && typeof service.provider === "object"
      ? (service.provider as Record<string, unknown>)
      : null;

  const toggleVisibility = async () => {
    const result = await confirm({
      title: hidden ? "Bỏ ẩn dịch vụ" : "Ẩn dịch vụ",
      description: hidden
        ? "Dịch vụ sẽ hiển thị lại trên kênh đặt lịch."
        : "Dịch vụ sẽ bị ẩn khỏi kênh đặt lịch của khách hàng.",
      tone: hidden ? "default" : "danger",
      input: hidden
        ? undefined
        : {
            label: "Lý do ẩn",
            placeholder: "Nhập lý do...",
            required: false,
          },
      confirmLabel: hidden ? "Bỏ ẩn" : "Ẩn dịch vụ",
      cancelLabel: "Hủy",
    });
    if (!result.confirmed) return;

    mutation.mutate(
      { hidden, reason: result.value?.trim() },
      {
        onSuccess: () => showToast(hidden ? "Đã bỏ ẩn dịch vụ." : "Đã ẩn dịch vụ.", "success"),
        onError: (error) => showToast(errorMessage(error), "error"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/services" className="text-sm font-semibold text-brand transition-colors hover:text-brand-hover">
        &larr; Quay lại danh sách dịch vụ
      </Link>

      <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">
              Dịch vụ #{id}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-foreground">
              {String(service.name ?? "Dịch vụ")}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill value={service.category} />
              <StatusPill value={service.isActive} />
              <StatusPill value={service.isHiddenByAdmin} />
            </div>
          </div>
          <Button
            onClick={toggleVisibility}
            disabled={mutation.isPending}
            className={hidden ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-red-600 text-white hover:bg-red-700"}
          >
            {hidden ? "Bỏ ẩn dịch vụ" : "Ẩn dịch vụ"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-foreground">Thông tin dịch vụ</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="name" value={service.name} />
            <DetailItem label="category" value={service.category} />
            <DetailItem label="price" value={service.price} />
            <DetailItem label="duration" value={service.duration} />
            <DetailItem label="isActive" value={service.isActive} />
            <DetailItem label="isHiddenByAdmin" value={service.isHiddenByAdmin} />
            <DetailItem label="createAt" value={service.createAt} />
            <DetailItem label="updateAt" value={service.updateAt} />
          </dl>
        </section>

        <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-foreground">Nhà cung cấp</h2>
          {provider ? (
            <EntityFields entity={{ id: String(provider.id ?? ""), ...provider }} />
          ) : (
            <p className="text-sm text-muted">Không có thông tin nhà cung cấp.</p>
          )}
        </section>
      </div>

      {Boolean(service.description) && (
        <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
          <h2 className="mb-2 font-bold text-foreground">Mô tả</h2>
          <p className="whitespace-pre-wrap text-sm text-muted">
            {String(service.description)}
          </p>
        </section>
      )}
    </div>
  );
}
