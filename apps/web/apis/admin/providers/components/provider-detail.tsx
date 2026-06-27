"use client";

import Link from "next/link";
import { ActionMenu } from "@/components/ui/action-menu";
import { PageHeader } from "@/components/ui/page-header";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { formatVietnameseDateTime } from "@/lib/date";
import { useAdminProviderDetail } from "../hooks/use-admin-provider-detail";
import { providerStatusLabels } from "../schema";
import { ProviderDocumentPanel } from "./provider-document-panel";
import { ProviderStatusBadge } from "./provider-status-badge";

export function ProviderDetail({
  providerId,
  backHref = "/admin/providers",
}: {
  providerId: string;
  backHref?: string;
}) {
  const state = useAdminProviderDetail(providerId);
  const provider = state.provider;

  if (state.providerQuery.isLoading) {
    return (
      <div className="grid min-h-[420px] place-items-center text-sm font-semibold text-muted">
        Đang tải hồ sơ nhà cung cấp...
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="w-full max-w-full space-y-6 p-6">
        <Link href={backHref} className="text-sm font-semibold text-blue-600">
          Quay lại
        </Link>
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-700">
            Không tìm thấy nhà cung cấp
          </p>
        </div>
      </div>
    );
  }

  const infoItems = [
    ["Email", provider.email ?? "Chưa cập nhật"],
    ["Số điện thoại", provider.phone ?? "Chưa cập nhật"],
    ["Địa chỉ", provider.address ?? "Chưa cập nhật"],
    ["Mã số thuế", provider.taxCode ?? "Chưa cập nhật"],
    ["Số CCCD", provider.identityNumber ?? "Chưa cập nhật"],
    ["Tên trên CCCD", provider.identityFullName ?? "Chưa cập nhật"],
    ["Ngân hàng", provider.bankCode ?? "Chưa cập nhật"],
    ["Số tài khoản", provider.bankAccountNumber ?? "Chưa cập nhật"],
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        backHref={backHref}
        backLabel="Quay lại"
        eyebrow="Quản trị / Nhà cung cấp"
        title={provider.businessName}
        description={`${provider.id} / ${providerStatusLabels[provider.providerStatus]}`}
        actions={
          <ActionMenu
            items={[
              ...(provider.providerStatus === "PENDING_VERIFICATION"
                ? [
                    {
                      label: "Duyệt nhà cung cấp",
                      onClick: () => void state.approveProvider(),
                    },
                    {
                      label: "Từ chối nhà cung cấp",
                      onClick: () => void state.rejectProvider(),
                      variant: "danger" as const,
                    },
                  ]
                : []),
              ...(provider.providerStatus === "VERIFIED"
                ? [
                    {
                      label: "Tạm ngưng nhà cung cấp",
                      onClick: () => void state.suspendProvider(),
                      variant: "danger" as const,
                    },
                  ]
                : []),
            ]}
          />
        }
      />

      <StatisticCardGrid columns={4}>
        <StatisticCard
          title="Trạng thái"
          value={providerStatusLabels[provider.providerStatus]}
          tone={provider.providerStatus === "VERIFIED" ? "green" : "amber"}
        />
        <StatisticCard
          title="Số dư ví"
          value={`${provider.walletBalance.toLocaleString("vi-VN")} đ`}
          tone="green"
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Tiền cọc"
          value={`${provider.depositBalance.toLocaleString("vi-VN")} đ`}
          tone="blue"
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Tỷ lệ hủy"
          value={`${provider.cancellationRate.toFixed(1)}%`}
          tone="red"
        />
      </StatisticCardGrid>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-950">Thông tin hồ sơ</h2>
          <ProviderStatusBadge status={provider.providerStatus} />
        </div>
        {provider.adminNote && (
          <p className="mt-4 rounded-xl bg-warning-soft p-4 text-sm font-semibold text-warning">
            Ghi chú admin: {provider.adminNote}
          </p>
        )}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {infoItems.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {label}
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                {value}
              </p>
            </div>
          ))}
          <div className="rounded-xl bg-gray-50 p-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Mô tả
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-gray-900">
              {provider.description ?? "Chưa cập nhật"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Cập nhật lần cuối
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-gray-900">
              {formatVietnameseDateTime(provider.updateAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-950">Tài liệu xác thực</h2>
        <ProviderDocumentPanel
          documents={provider.documents}
          providerStatus={provider.providerStatus}
        />
      </div>
    </div>
  );
}
