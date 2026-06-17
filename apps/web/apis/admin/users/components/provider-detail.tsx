"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionMenu } from "@/components/ui/action-menu";
import { PageHeader } from "@/components/ui/page-header";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { TRUST_RISK_LABELS } from "@/constants/trust-score";
import { cn } from "@/lib/utils";
import { accountStatusActionSchema } from "../schema";
import type { AdminAccountStatus } from "../schema";
import { useAdminProviders } from "../queries";
import type { AdminProviderAccount } from "../queries";

const statusLabels: Record<AdminAccountStatus, string> = {
  ACTIVE: "Đang hoạt động",
  SUSPENDED: "Tạm khóa",
};

const riskTone = {
  LOW: "green",
  WATCH: "amber",
  RESTRICTED: "red",
  SUSPENDED: "slate",
} as const;

const severityStyles = {
  LOW: "bg-success-soft text-success",
  MEDIUM: "bg-warning-soft text-warning",
  HIGH: "bg-danger-soft text-danger",
} as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function handleStatusAction(provider: AdminProviderAccount) {
  const nextStatus: AdminAccountStatus =
    provider.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  const reason = window.prompt(
    nextStatus === "ACTIVE"
      ? "Nhập lý do mở khóa nhà cung cấp:"
      : "Nhập lý do tạm khóa nhà cung cấp:",
  );

  if (!reason) return;

  const result = accountStatusActionSchema.safeParse({
    accountId: provider.id,
    role: "SERVICE_PROVIDER",
    status: nextStatus,
    reason,
    durationType: "PERMANENT",
  });

  if (!result.success) {
    window.alert(result.error.issues[0]?.message ?? "Thao tác trạng thái không hợp lệ.");
    return;
  }

  window.alert(
    `Trạng thái của ${provider.businessName} sẽ đổi thành ${statusLabels[nextStatus]} (mock).`,
  );
}

export function ProviderDetail({ providerId }: { providerId: string }) {
  const router = useRouter();
  const { data: providers } = useAdminProviders();
  const provider = providers.find((item) => item.id === providerId);

  if (!provider) {
    return (
      <div className="w-full max-w-full space-y-6 p-6">
        <Link
          href="/admin/providers"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Quay lại nhà cung cấp
        </Link>
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-700">
            Không tìm thấy nhà cung cấp
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Nhà cung cấp mock này có thể chưa tồn tại trong bộ dữ liệu hiện tại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        backHref="/admin/providers"
        backLabel="Quay lại nhà cung cấp"
        title={provider.businessName}
        description={`${provider.id} / Chủ sở hữu: ${provider.ownerName}`}
        actions={
          <ActionMenu
            items={[
              {
                label: "Rà soát xác thực",
                onClick: () =>
                  window.alert("Mở khu vực xác thực (mock)."),
              },
              {
                label: "Xem sổ cái số dư",
                onClick: () =>
                  router.push(`/admin/providers/${provider.id}/balance`),
              },
              {
                label:
                  provider.status === "ACTIVE"
                    ? "Tạm khóa nhà cung cấp"
                    : "Mở khóa nhà cung cấp",
                onClick: () => handleStatusAction(provider),
                variant: provider.status === "ACTIVE" ? "danger" : "default",
              },
            ]}
          />
        }
      />

      <StatisticCardGrid columns={4}>
        <StatisticCard
          title="Đặt lịch"
          value={provider.bookingsCount}
          tone="blue"
        />
        <StatisticCard
          title="Doanh thu"
          value={formatCurrency(provider.revenueVnd)}
          tone="green"
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Dịch vụ"
          value={provider.servicesCount}
          tone="purple"
        />
        <StatisticCard
          title="Đánh giá"
          value={provider.rating.toFixed(1)}
          tone="amber"
        />
      </StatisticCardGrid>

      <StatisticCardGrid columns={4}>
        <StatisticCard
          title="Số dư khả dụng"
          value={formatCurrency(provider.balance.availableBalance)}
          tone="green"
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Số dư đã giữ"
          value={formatCurrency(provider.balance.reservedBalance)}
          tone="amber"
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Công nợ"
          value={formatCurrency(provider.balance.debtBalance)}
          tone={provider.balance.debtBalance > 0 ? "red" : "slate"}
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Điểm tin cậy"
          value={`${provider.trustScore.score}/100`}
          tone={riskTone[provider.trustScore.riskLevel]}
          footer={TRUST_RISK_LABELS[provider.trustScore.riskLevel]}
        />
      </StatisticCardGrid>

      <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Chỉ số điểm tin cậy
            </h2>
            <p className="mt-1 text-sm text-muted">
              Các chỉ số rủi ro dùng cho rà soát admin và điều kiện nhận đặt lịch tiền mặt.
            </p>
          </div>
          <Link
            href={`/admin/providers/${provider.id}/balance`}
            className="inline-flex h-10 items-center rounded-xl border border-border-subtle px-4 text-sm font-bold text-foreground shadow-sm hover:bg-surface-muted"
          >
            Mở số dư
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ["Tỷ lệ hoàn tất", formatPercent(provider.trustScore.completionRate)],
            ["Tỷ lệ vắng mặt", formatPercent(provider.trustScore.noShowRate)],
            ["Tỷ lệ tranh chấp", formatPercent(provider.trustScore.disputeRate)],
            [
              "Bất thường tiền mặt",
              formatPercent(provider.trustScore.cashAbnormalityRate),
            ],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-surface-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                {label}
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-950">Chi tiết nhà cung cấp</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            ["Email", provider.email],
            ["Số điện thoại", provider.phone],
            ["Trạng thái", statusLabels[provider.status]],
            ["Xác thực", provider.verificationStatus],
            ["Ngày tham gia", formatDate(provider.joinedAt)],
            ["Lý do khóa", provider.banReason ?? "Không có"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {label}
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">Lịch sử vi phạm</h2>
        {provider.violations.length === 0 ? (
          <p className="mt-4 rounded-xl bg-surface-muted p-4 text-sm font-semibold text-muted">
            Nhà cung cấp này chưa có vi phạm nào.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border-subtle rounded-xl border border-border-subtle">
            {provider.violations.map((violation) => (
              <div
                key={violation.id}
                className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-foreground">{violation.id}</p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-bold",
                        severityStyles[violation.severity],
                      )}
                    >
                      {violation.severity}
                    </span>
                    <span className="text-xs font-semibold text-muted">
                      {violation.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{violation.note}</p>
                </div>
                <p className="text-sm font-semibold text-subtle">
                  {formatDate(violation.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
