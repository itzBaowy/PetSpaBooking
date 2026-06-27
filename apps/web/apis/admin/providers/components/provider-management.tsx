"use client";

import { useRouter } from "next/navigation";
import { ActionMenu } from "@/components/ui/action-menu";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { formatVietnameseDate } from "@/lib/date";
import { useAdminProviderList } from "../hooks/use-admin-provider-list";
import { countProvidersByStatus, getProviderInitial, providerStatusFilterOptions } from "../provider-helpers";
import type { AdminProvider, AdminProviderStatus } from "../schema";
import { ProviderStatusBadge } from "./provider-status-badge";

export function ProviderManagement({
  defaultStatus,
  verificationOnly = false,
}: {
  defaultStatus?: AdminProviderStatus;
  verificationOnly?: boolean;
}) {
  const router = useRouter();
  const state = useAdminProviderList(defaultStatus);
  const records = state.records;

  const columns: Array<DataTableColumn<AdminProvider>> = [
    {
      key: "provider",
      header: "Nhà cung cấp",
      widthClassName: "w-[26%]",
      render: (provider) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-50 text-sm font-bold text-purple-700">
            {provider.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={provider.avatarUrl} alt={provider.businessName} className="h-full w-full object-cover" />
            ) : (
              getProviderInitial(provider)
            )}
          </div>
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-gray-950">{provider.businessName}</p>
            <p className="text-xs font-medium text-gray-500">{provider.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Liên hệ",
      widthClassName: "w-[24%]",
      render: (provider) => (
        <div>
          <p className="break-words text-sm text-gray-900">{provider.email ?? "Chưa cập nhật"}</p>
          <p className="text-xs text-gray-500">{provider.phone ?? "Chưa cập nhật"}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      widthClassName: "w-[16%]",
      render: (provider) => <ProviderStatusBadge status={provider.providerStatus} />,
    },
    {
      key: "balance",
      header: "Số dư",
      widthClassName: "w-[16%]",
      render: (provider) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {provider.walletBalance.toLocaleString("vi-VN")} đ
          </p>
          <p className="text-xs text-gray-500">
            Cọc: {provider.depositBalance.toLocaleString("vi-VN")} đ
          </p>
        </div>
      ),
    },
    {
      key: "created",
      header: "Ngày tạo",
      widthClassName: "w-[12%]",
      render: (provider) => (
        <span className="text-sm text-gray-700">
          {formatVietnameseDate(provider.createAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      isAction: true,
      widthClassName: "w-[10%]",
      render: (provider) => (
        <ActionMenu
          items={[
            {
              label: verificationOnly ? "Rà soát hồ sơ" : "Xem nhà cung cấp",
              onClick: () =>
                router.push(
                  `/admin/providers/${provider.id}`,
                ),
            },
            ...(provider.providerStatus === "PENDING_VERIFICATION"
              ? [
                  {
                    label: "Duyệt nhà cung cấp",
                    onClick: () => void state.approveProvider(provider),
                  },
                  {
                    label: "Từ chối nhà cung cấp",
                    onClick: () => void state.rejectProvider(provider),
                    variant: "danger" as const,
                  },
                ]
              : []),
            ...(provider.providerStatus === "VERIFIED"
              ? [
                  {
                    label: "Tạm ngưng nhà cung cấp",
                    onClick: () => void state.suspendProvider(provider),
                    variant: "danger" as const,
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6">
      {!verificationOnly && (
        <PageHeader
          eyebrow="Quản trị / Nhà cung cấp"
          title="Quản lý nhà cung cấp"
          description="Quản lý hồ sơ, trạng thái xác thực, số dư và quyền hoạt động của nhà cung cấp."
        />
      )}

      <StatisticCardGrid columns={4}>
        <StatisticCard title="Theo bộ lọc" value={state.total} tone="blue" />
        <StatisticCard title="Chờ duyệt" value={countProvidersByStatus(records, "PENDING_VERIFICATION")} tone="amber" />
        <StatisticCard title="Đã xác thực" value={countProvidersByStatus(records, "VERIFIED")} tone="green" />
        <StatisticCard title="Tạm ngưng/Từ chối" value={countProvidersByStatus(records, "SUSPENDED") + countProvidersByStatus(records, "REJECTED")} tone="red" />
      </StatisticCardGrid>

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <SearchInput
            className="w-full xl:max-w-md"
            value={state.search}
            placeholder="Tìm theo tên nhà cung cấp"
            onChange={state.changeSearch}
          />
          <CustomSelect
            className="w-full sm:w-56"
            value={state.providerStatus}
            options={providerStatusFilterOptions}
            onValueChange={(value) => state.changeStatus(value as "" | AdminProviderStatus)}
          />
          <div className="text-sm font-medium text-gray-500 xl:ml-auto">
            {state.providersQuery.isFetching ? "Đang tải..." : `${state.total} nhà cung cấp`}
          </div>
        </div>
      </div>

      {state.providersQuery.isError ? (
        <div className="rounded-2xl border border-danger/20 bg-danger-soft p-6 text-sm font-semibold text-danger">
          Không thể tải danh sách nhà cung cấp. Vui lòng kiểm tra API hoặc quyền admin.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={records}
          getRowKey={(provider) => provider.id}
          minWidthClassName="min-w-[1120px]"
          emptyState={
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-gray-700">Không tìm thấy nhà cung cấp</p>
              <p className="mt-1 text-xs text-gray-500">Thử từ khóa hoặc trạng thái khác.</p>
            </div>
          }
        />
      )}

      <Pagination
        page={state.page}
        totalPages={state.totalPages}
        onPageChange={state.setPage}
        pageSize={state.pageSize}
        pageSizeOptions={[10, 20, 50]}
        onPageSizeChange={state.changePageSize}
      />
    </div>
  );
}
