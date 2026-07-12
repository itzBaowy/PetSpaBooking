"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import { useConfirmDialog, useToast } from "@/components/ui";
import type { ApiResponse } from "@/types/api";
import type { AdminEntity } from "@/apis/admin/supported-api";
import {
  StatusPill,
  EntityTable,
  FilterSelect,
  LoadState,
  PageTitle,
  Pager,
  errorMessage,
  inputClass,
  useAdminList,
} from "../shared";

const categoryOptions = [
  { value: "", label: "Mọi danh mục" },
  { value: "GROOMING", label: "Chăm sóc lông" },
  { value: "SPA", label: "Spa" },
  { value: "BOARDING", label: "Lưu trú" },
  { value: "TRAINING", label: "Huấn luyện" },
  { value: "VETERINARY", label: "Thú y" },
  { value: "OTHER", label: "Khác" },
];

const booleanOptions = [
  { value: "", label: "Tất cả" },
  { value: "true", label: "Có" },
  { value: "false", label: "Không" },
];

export function AdminServicesPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirmDialog();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [providerId, setProviderId] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState("");
  const [isHiddenByAdmin, setIsHiddenByAdmin] = useState("");

  const query = useAdminList("services", API_ENDPOINTS.ADMIN.SERVICES.LIST, {
    page,
    pageSize,
    keyword,
    providerId,
    category,
    isActive,
    isHiddenByAdmin,
  });

  const visibilityMutation = useMutation({
    mutationFn: async ({
      serviceId,
      hidden,
      reason,
    }: {
      serviceId: string;
      hidden: boolean;
      reason?: string;
    }) => {
      const url = hidden
        ? API_ENDPOINTS.ADMIN.SERVICES.UNHIDE(serviceId)
        : API_ENDPOINTS.ADMIN.SERVICES.HIDE(serviceId);
      const body = !hidden && reason ? { reason } : undefined;
      return (await api.patch<ApiResponse<unknown>>(url, body)).data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-real"] });
    },
  });

  const toggleVisibility = async (item: AdminEntity) => {
    const hidden = item.isHiddenByAdmin === true;
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
            placeholder: "Nhập lý do vi phạm/chưa phù hợp...",
            required: false,
          },
      confirmLabel: hidden ? "Bỏ ẩn" : "Ẩn dịch vụ",
      cancelLabel: "Hủy",
    });
    if (!result.confirmed) return;

    visibilityMutation.mutate(
      {
        serviceId: item.id,
        hidden,
        reason: result.value?.trim(),
      },
      {
        onSuccess: () =>
          showToast(
            hidden ? "Đã bỏ ẩn dịch vụ." : "Đã ẩn dịch vụ.",
            "success",
          ),
        onError: (error) => showToast(errorMessage(error), "error"),
      },
    );
  };

  if (query.isError) {
    return <LoadState error={query.error} retry={() => void query.refetch()} />;
  }

  return (
    <div className="space-y-5">
      <PageTitle
        title="Quản lý dịch vụ"
        description="Danh sách dịch vụ nhà cung cấp theo API /admin/services, hỗ trợ ẩn hoặc bỏ ẩn khỏi kênh đặt lịch."
      />

      <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm tên hoặc mô tả dịch vụ"
            className={inputClass}
          />
          <input
            value={providerId}
            onChange={(event) => {
              setProviderId(event.target.value);
              setPage(1);
            }}
            placeholder="Mã nhà cung cấp"
            className={inputClass}
          />
          <FilterSelect
            className="w-full sm:w-48"
            value={category}
            options={categoryOptions}
            onChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
          />
          <FilterSelect
            className="w-full sm:w-44"
            value={isActive}
            options={[
              { value: "", label: "Mọi trạng thái" },
              { value: "true", label: "Đang bật" },
              { value: "false", label: "Đang tắt" },
            ]}
            onChange={(value) => {
              setIsActive(value);
              setPage(1);
            }}
          />
          <FilterSelect
            className="w-full sm:w-44"
            value={isHiddenByAdmin}
            options={booleanOptions.map((item) => ({
              ...item,
              label:
                item.value === ""
                  ? "Ẩn bởi admin?"
                  : item.value === "true"
                    ? "Đang bị ẩn"
                    : "Không bị ẩn",
            }))}
            onChange={(value) => {
              setIsHiddenByAdmin(value);
              setPage(1);
            }}
          />
          <span className="ml-auto self-center text-sm font-medium text-muted">
            {query.isFetching
              ? "Đang tải..."
              : `${query.data?.pagination.totalItems ?? 0} dịch vụ`}
          </span>
        </div>
      </div>

      <EntityTable
        loading={query.isLoading}
        items={query.data?.items}
        columns={[
          "name",
          "provider.businessName",
          "category",
          "price",
          "duration",
          "isActive",
          "isHiddenByAdmin",
        ]}
        renderers={{
          isActive: (item) => (
            <StatusPill value={item.isActive ? "Đang bật" : "Đang tắt"} />
          ),
          isHiddenByAdmin: (item) => (
            <StatusPill
              value={item.isHiddenByAdmin ? "Đang bị ẩn" : "Đang hiển thị"}
            />
          ),
        }}
        detailBase="/admin/services"
        actions={(item) => [
          {
            label: item.isHiddenByAdmin === true ? "Bỏ ẩn" : "Ẩn dịch vụ",
            onClick: () => void toggleVisibility(item),
            variant: item.isHiddenByAdmin === true ? "default" : "danger",
          },
        ]}
      />
      <Pager data={query.data} setPage={setPage} setPageSize={setPageSize} />
    </div>
  );
}
