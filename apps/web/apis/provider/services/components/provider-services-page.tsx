"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/feedback-provider";
import {
  ProviderBadge,
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerDate,
  providerErrorText,
  providerMoney,
} from "@/apis/provider/_shared/provider-ui";
import {
  useDeleteProviderService,
  useProviderServices,
  useToggleProviderService,
} from "../queries";

export function ProviderServicesPage() {
  const query = useProviderServices();
  const toggle = useToggleProviderService();
  const remove = useDeleteProviderService();
  const { showToast } = useToast();
  const items = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Dịch vụ"
        description="Quản lý dịch vụ đang được lấy từ API provider."
        action={
          <Link
            href="/provider/services/create"
            className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-hover"
          >
            Tạo dịch vụ
          </Link>
        }
      />

      {items.length === 0 ? (
        <ProviderEmpty text="Chưa có dịch vụ." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface shadow-sm">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-surface-muted text-xs font-extrabold uppercase text-subtle">
              <tr>
                {["Dịch vụ", "Giá", "Thời lượng", "Trạng thái", "Cập nhật", ""].map((title) => (
                  <th className="px-4 py-3" key={title}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-muted/50">
                  <td className="px-4 py-4">
                    <strong className="block">{item.name}</strong>
                    <span className="mt-1 block text-xs text-muted">
                      {item.category?.name ?? "Chưa phân loại"}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold">{providerMoney.format(item.price)}</td>
                  <td className="px-4 py-4 text-sm">{item.duration} phút</td>
                  <td className="px-4 py-4">
                    <ProviderBadge
                      value={
                        item.isHiddenByAdmin
                          ? "Ẩn bởi admin"
                          : item.isActive
                            ? "Đang hiển thị"
                            : "Đang ẩn"
                      }
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {providerDate(item.updateAt ?? item.createAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        className="inline-flex min-h-10 items-center rounded-xl border border-border-muted px-4 text-sm font-bold hover:bg-surface-muted"
                        href={`/provider/services/${item.id}/edit`}
                      >
                        Sửa
                      </Link>
                      <Button
                        variant="outline"
                        disabled={item.isHiddenByAdmin || toggle.isLoading}
                        onClick={() =>
                          toggle.mutate(item.id, {
                            onSuccess: () => showToast("Đã cập nhật trạng thái dịch vụ.", "success"),
                            onError: (error) => showToast(providerErrorText(error), "error"),
                          })
                        }
                      >
                        {item.isActive ? "Ẩn" : "Hiện"}
                      </Button>
                      <Button
                        variant="outline"
                        disabled={remove.isLoading}
                        onClick={() => {
                          if (!window.confirm(`Xóa dịch vụ "${item.name}"?`)) return;
                          remove.mutate(item.id, {
                            onSuccess: () => showToast("Đã xóa dịch vụ.", "success"),
                            onError: (error) => showToast(providerErrorText(error), "error"),
                          });
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
