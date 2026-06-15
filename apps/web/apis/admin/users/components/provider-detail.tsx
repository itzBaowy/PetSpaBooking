"use client";

import Link from "next/link";
import { ActionMenu } from "@/components/ui/action-menu";
import { PageHeader } from "@/components/ui/page-header";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { accountStatusActionSchema } from "../schema";
import type { AdminAccountStatus } from "../schema";
import { useAdminProviders } from "../queries";
import type { AdminProviderAccount } from "../queries";

const statusLabels: Record<AdminAccountStatus, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function handleStatusAction(provider: AdminProviderAccount) {
  const nextStatus: AdminAccountStatus =
    provider.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  const reason = window.prompt(
    nextStatus === "ACTIVE"
      ? "Reason for unlocking this provider:"
      : "Reason for suspending this provider:",
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
    window.alert(result.error.issues[0]?.message ?? "Invalid status action.");
    return;
  }

  window.alert(
    `${provider.businessName} status would be changed to ${statusLabels[nextStatus]} (mock).`,
  );
}

export function ProviderDetail({ providerId }: { providerId: string }) {
  const { data: providers } = useAdminProviders();
  const provider = providers.find((item) => item.id === providerId);

  if (!provider) {
    return (
      <div className="w-full max-w-full space-y-6 p-6">
        <Link
          href="/admin/providers"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Back to providers
        </Link>
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-700">
            Provider not found
          </p>
          <p className="mt-1 text-xs text-gray-500">
            This mock provider may not exist in the current dataset.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        backHref="/admin/providers"
        backLabel="Back to providers"
        title={provider.businessName}
        description={`${provider.id} / Owner: ${provider.ownerName}`}
        actions={
          <ActionMenu
            items={[
              {
                label: "Review verification",
                onClick: () =>
                  window.alert("Open verification workspace (mock)."),
              },
              {
                label:
                  provider.status === "ACTIVE"
                    ? "Suspend provider"
                    : "Unlock provider",
                onClick: () => handleStatusAction(provider),
                variant: provider.status === "ACTIVE" ? "danger" : "default",
              },
            ]}
          />
        }
      />

      <StatisticCardGrid columns={4}>
        <StatisticCard
          title="Bookings"
          value={provider.bookingsCount}
          tone="blue"
        />
        <StatisticCard
          title="Revenue"
          value={formatCurrency(provider.revenueVnd)}
          tone="green"
          valueClassName="text-2xl"
        />
        <StatisticCard
          title="Services"
          value={provider.servicesCount}
          tone="purple"
        />
        <StatisticCard
          title="Rating"
          value={provider.rating.toFixed(1)}
          tone="amber"
        />
      </StatisticCardGrid>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-950">Provider details</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            ["Email", provider.email],
            ["Phone", provider.phone],
            ["Status", statusLabels[provider.status]],
            ["Verification", provider.verificationStatus],
            ["Joined", formatDate(provider.joinedAt)],
            ["Ban reason", provider.banReason ?? "None"],
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
    </div>
  );
}
