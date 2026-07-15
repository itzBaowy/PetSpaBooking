"use client";

import axios from "axios";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProviderServiceApi } from "@/types/provider-api";
import { ActionMenu } from "@/components/ui/action-menu";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/feedback-provider";
import { Input, Textarea } from "@/components/ui/input";
import {
  ProviderBadge,
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  ProviderPagination,
  ProviderPageHeader,
  providerDate,
  providerErrorText,
  providerMoney,
  sortByDateDesc,
} from "@/apis/provider/_shared/provider-ui";
import {
  useDeleteProviderService,
  useProviderServices,
  useSaveProviderService,
  useToggleProviderService,
} from "../queries";

const serviceCategories = ["GROOMING", "SPA", "BOARDING", "TRAINING", "VETERINARY", "OTHER"];
const serviceCategoryLabels: Record<string, string> = {
  GROOMING: "Tắm/grooming",
  SPA: "Spa",
  BOARDING: "Lưu trú",
  TRAINING: "Huấn luyện",
  VETERINARY: "Thú y",
  OTHER: "Khác",
};
const emptyServiceDraft = {
  name: "",
  description: "",
  price: 0,
  duration: 30,
  category: "GROOMING",
};

export function ProviderServicesPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const query = useProviderServices({ page, pageSize });
  const toggle = useToggleProviderService();
  const remove = useDeleteProviderService();
  const save = useSaveProviderService();
  const { showToast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ProviderServiceApi | null>(null);
  const [detailService, setDetailService] = useState<ProviderServiceApi | null>(null);
  const [draft, setDraft] = useState(emptyServiceDraft);
  const items = useMemo(
    () => sortByDateDesc(query.data?.items ?? [], (item) => item.updateAt ?? item.createAt),
    [query.data?.items],
  );

  const openCreateForm = () => {
    setEditingService(null);
    setDraft(emptyServiceDraft);
    setFormOpen(true);
  };

  const openEditForm = (service: ProviderServiceApi) => {
    setEditingService(service);
    setDraft({
      name: service.name,
      description: service.description ?? "",
      price: service.price,
      duration: service.duration,
      category: service.category?.name ?? "GROOMING",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingService(null);
    setDraft(emptyServiceDraft);
  };

  const toggleService = (service: ProviderServiceApi) => {
    if (toggle.isLoading) return;
    toggle.mutate(service.id, {
      onSuccess: () => showToast("Đã cập nhật trạng thái dịch vụ.", "success"),
      onError: (error) => showToast(providerErrorText(error), "error"),
    });
  };

  const deleteService = (service: ProviderServiceApi) => {
    if (remove.isLoading) return;
    if (!window.confirm(`Xóa dịch vụ "${service.name}"?`)) return;
    remove.mutate(service.id, {
      onSuccess: () => showToast("Đã xóa dịch vụ.", "success"),
      onError: (error) => showToast(providerErrorText(error), "error"),
    });
  };

  if (query.isLoading) return <ProviderLoading />;
  if (isProviderDepositError(query.error)) {
    return <ProviderDepositRequiredNotice retry={() => void query.refetch()} />;
  }
  if (query.isError) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Dịch vụ"
        description="Quản lý dịch vụ đang được lấy từ API provider."
        action={<Button onClick={openCreateForm}>Tạo dịch vụ</Button>}
      />

      {items.length === 0 ? (
        <ProviderEmpty text="Chưa có dịch vụ." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface shadow-sm">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-surface-muted text-xs font-extrabold uppercase text-subtle">
              <tr>
                {["Dịch vụ", "Giá", "Thời lượng", "Trạng thái", "Cập nhật", "Thao tác"].map((title) => (
                  <th className="px-4 py-3 last:text-right" key={title}>
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
                      {serviceCategoryLabels[item.category?.name ?? ""] ?? item.category?.name ?? "Chưa phân loại"}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold">{providerMoney.format(item.price)}</td>
                  <td className="px-4 py-4 text-sm">{item.duration} phút</td>
                  <td className="px-4 py-4">
                    <ProviderBadge value={serviceStatusLabel(item)} />
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {providerDate(item.updateAt ?? item.createAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <ActionMenu
                      items={[
                        { label: "Xem chi tiết", onClick: () => setDetailService(item) },
                        { label: "Cập nhật dịch vụ", onClick: () => openEditForm(item) },
                        ...(!item.isHiddenByAdmin
                          ? [
                              {
                                label: item.isActive ? "Ẩn dịch vụ" : "Hiện dịch vụ",
                                onClick: () => toggleService(item),
                              },
                            ]
                          : []),
                        {
                          label: "Xóa dịch vụ",
                          onClick: () => deleteService(item),
                          variant: "danger" as const,
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {query.data ? (
        <ProviderPagination
          page={query.data.page}
          pageSize={query.data.pageSize}
          totalItems={query.data.totalItem}
          totalPages={query.data.totalPage}
          onPageChange={setPage}
        />
      ) : null}

      {formOpen ? (
        <Dialog
          title={editingService ? "Cập nhật dịch vụ" : "Tạo dịch vụ"}
          onClose={closeForm}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold">
              Tên dịch vụ *
              <Input
                className="mt-2"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </label>
            <label className="text-sm font-bold">
              Danh mục
              <select
                className="mt-2 h-11 w-full rounded-xl border border-border-muted bg-surface px-3 text-sm font-semibold"
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              >
                {serviceCategories.map((category) => (
                  <option key={category} value={category}>
                    {serviceCategoryLabels[category] ?? category}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold">
              Giá (VND) *
              <Input
                className="mt-2"
                type="number"
                min={0}
                value={draft.price}
                onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })}
              />
            </label>
            <label className="text-sm font-bold">
              Thời lượng (phút) *
              <Input
                className="mt-2"
                type="number"
                min={1}
                value={draft.duration}
                onChange={(event) => setDraft({ ...draft, duration: Number(event.target.value) })}
              />
            </label>
            <label className="text-sm font-bold md:col-span-2">
              Mô tả
              <Textarea
                className="mt-2"
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
            </label>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button variant="outline" onClick={closeForm}>
                Hủy
              </Button>
              <Button
                disabled={!draft.name.trim() || draft.price < 0 || draft.duration <= 0 || save.isLoading}
                onClick={() =>
                  save.mutate(
                    {
                      id: editingService?.id,
                      payload: {
                        name: draft.name.trim(),
                        description: draft.description.trim(),
                        price: draft.price,
                        duration: draft.duration,
                        category: draft.category,
                      },
                    },
                    {
                      onSuccess: () => {
                        showToast(
                          editingService ? "Đã cập nhật dịch vụ." : "Đã tạo dịch vụ.",
                          "success",
                        );
                        closeForm();
                      },
                      onError: (error) => showToast(providerErrorText(error), "error"),
                    },
                  )
                }
              >
                {save.isLoading
                  ? "Đang lưu..."
                  : editingService
                    ? "Cập nhật dịch vụ"
                    : "Tạo dịch vụ"}
              </Button>
            </div>
          </div>
        </Dialog>
      ) : null}

      {detailService ? (
        <Dialog title="Chi tiết dịch vụ" onClose={() => setDetailService(null)}>
          <div className="space-y-5">
            <div className="rounded-2xl border border-border-subtle bg-surface-muted p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-foreground">{detailService.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-muted">
                    {serviceCategoryLabels[detailService.category?.name ?? ""] ??
                      detailService.category?.name ??
                      "Chưa phân loại"}
                  </p>
                </div>
                <ProviderBadge value={serviceStatusLabel(detailService)} />
              </div>
            </div>

            <dl className="grid gap-3 md:grid-cols-2">
              <ServiceDetail label="Giá" value={providerMoney.format(detailService.price)} />
              <ServiceDetail label="Thời lượng" value={`${detailService.duration} phút`} />
              <ServiceDetail label="Trạng thái" value={serviceStatusLabel(detailService)} />
              <ServiceDetail
                label="Cập nhật lần cuối"
                value={providerDate(detailService.updateAt ?? detailService.createAt)}
              />
              <ServiceDetail
                label="Mô tả"
                value={detailService.description || "Chưa có mô tả."}
                wide
              />
            </dl>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDetailService(null)}>
                Đóng
              </Button>
              <Button
                onClick={() => {
                  openEditForm(detailService);
                  setDetailService(null);
                }}
              >
                Cập nhật dịch vụ
              </Button>
            </div>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}

function serviceStatusLabel(service: ProviderServiceApi) {
  if (service.isHiddenByAdmin) return "Ẩn bởi admin";
  return service.isActive ? "Đang hiển thị" : "Đang ẩn";
}

function ServiceDetail({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <dt className="text-xs font-extrabold uppercase text-subtle">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function isProviderDepositError(error: unknown) {
  if (!axios.isAxiosError(error)) return false;

  const message = String(error.response?.data?.message ?? error.message ?? "");
  return (
    error.response?.status === 403 &&
    /deposit|đặt cọc|ký quỹ|ACTIVE|VND/i.test(message)
  );
}

function ProviderDepositRequiredNotice({ retry }: { retry: () => void }) {
  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Dịch vụ"
        description="Bạn cần kích hoạt ký quỹ trước khi tạo và quản lý dịch vụ."
      />

      <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-extrabold text-brand">
              Cần nạp ký quỹ
            </span>
            <h2 className="mt-3 text-xl font-extrabold text-foreground">
              Ký quỹ chưa sẵn sàng để quản lý dịch vụ
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">
              Để đảm bảo vận hành và nhận booking ổn định, provider cần có ký quỹ
              ở trạng thái hoạt động. Bạn có thể nạp ký quỹ trong Ví provider rồi
              quay lại kiểm tra danh sách dịch vụ.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link
              href="/provider/wallet?deposit=1"
              className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-hover"
            >
              Nạp ký quỹ
            </Link>
            <Link
              href="/provider/wallet"
              className="inline-flex min-h-11 items-center rounded-xl border border-border-muted px-5 py-2 text-sm font-bold text-foreground hover:bg-surface-muted"
            >
              Xem ví
            </Link>
            <Button variant="outline" onClick={retry}>
              Kiểm tra lại
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
