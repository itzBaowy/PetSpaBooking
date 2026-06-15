"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionMenu } from "@/components/ui/action-menu";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { accountStatusActionSchema } from "../schema";
import type {
  AdminAccountStatus,
  ProviderType,
  ProviderVerificationStatus,
} from "../schema";
import { useAdminProviders } from "../queries";
import type { AdminProviderAccount } from "../queries";

const TYPE_FILTERS: Array<{ label: string; value: "" | ProviderType }> = [
  { label: "All types", value: "" },
  { label: "Clinics", value: "CLINIC" },
  { label: "Grooming", value: "GROOMING" },
  { label: "Pet Hotels", value: "PET_HOTEL" },
  { label: "Spa", value: "SPA" },
];

const STATUS_FILTERS: Array<{ label: string; value: "" | AdminAccountStatus }> =
  [
    { label: "All statuses", value: "" },
    { label: "Active", value: "ACTIVE" },
    { label: "Suspended", value: "SUSPENDED" },
  ];

const typeLabels: Record<ProviderType, string> = {
  CLINIC: "Clinic",
  GROOMING: "Grooming",
  PET_HOTEL: "Pet Hotel",
  SPA: "Spa",
};

const verificationLabels: Record<ProviderVerificationStatus, string> = {
  VERIFIED: "Verified",
  PENDING: "Pending",
  REJECTED: "Rejected",
};

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

function StatusBadge({ status }: { status: AdminAccountStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        status === "ACTIVE"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

function VerificationBadge({
  status,
}: {
  status: ProviderVerificationStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        status === "VERIFIED" &&
          "border-green-200 bg-green-50 text-green-700",
        status === "PENDING" &&
          "border-amber-200 bg-amber-50 text-amber-700",
        status === "REJECTED" && "border-red-200 bg-red-50 text-red-700",
      )}
    >
      {verificationLabels[status]}
    </span>
  );
}

function createStatusPayload(provider: AdminProviderAccount) {
  const nextStatus: AdminAccountStatus =
    provider.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  if (nextStatus === "ACTIVE") {
    const reason = window.prompt("Reason for unlocking this provider:");
    if (!reason) return null;

    return accountStatusActionSchema.safeParse({
      accountId: provider.id,
      role: "SERVICE_PROVIDER",
      status: nextStatus,
      reason,
      durationType: "PERMANENT",
    });
  }

  const reason = window.prompt("Reason for suspending this provider:");
  if (!reason) return null;

  const days = window.prompt(
    "Temporary suspension duration in days. Leave blank for permanent suspension:",
  );
  const durationDays = days ? Number(days) : undefined;

  return accountStatusActionSchema.safeParse({
    accountId: provider.id,
    role: "SERVICE_PROVIDER",
    status: nextStatus,
    reason,
    durationType: durationDays ? "TEMPORARY" : "PERMANENT",
    durationDays,
  });
}

export function ProviderManagement() {
  const router = useRouter();
  const { data: providers } = useAdminProviders();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | ProviderType>("");
  const [statusFilter, setStatusFilter] = useState<"" | AdminAccountStatus>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const debouncedSearch = useDebounce(search, 300);

  const filteredProviders = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return providers.filter((provider) => {
      if (typeFilter && provider.providerType !== typeFilter) return false;
      if (statusFilter && provider.status !== statusFilter) return false;
      if (!query) return true;

      return [
        provider.id,
        provider.businessName,
        provider.ownerName,
        provider.email,
        provider.phone,
        typeLabels[provider.providerType],
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [providers, debouncedSearch, typeFilter, statusFilter]);

  const total = filteredProviders.length;
  const totalPages = Math.ceil(total / pageSize);
  const records = filteredProviders.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const activeCount = providers.filter(
    (provider) => provider.status === "ACTIVE",
  ).length;
  const suspendedCount = providers.filter(
    (provider) => provider.status === "SUSPENDED",
  ).length;
  const verifiedCount = providers.filter(
    (provider) => provider.verificationStatus === "VERIFIED",
  ).length;

  const handleStatusAction = (provider: AdminProviderAccount) => {
    const result = createStatusPayload(provider);
    if (!result) return;

    if (!result.success) {
      window.alert(result.error.issues[0]?.message ?? "Invalid status action.");
      return;
    }

    window.alert(
      `${provider.businessName} status would be changed to ${statusLabels[result.data.status]} (mock).`,
    );
  };

  const columns: Array<DataTableColumn<AdminProviderAccount>> = [
    {
      key: "provider",
      header: "Provider",
      widthClassName: "w-[24%]",
      render: (provider) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 text-sm font-bold text-purple-700">
            {provider.businessName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-gray-950">
              {provider.businessName}
            </p>
            <p className="text-xs font-medium text-gray-500">{provider.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner contact",
      widthClassName: "w-[22%]",
      render: (provider) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {provider.ownerName}
          </p>
          <p className="break-words text-xs text-gray-500">{provider.email}</p>
          <p className="text-xs text-gray-500">{provider.phone}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      widthClassName: "w-[12%]",
      render: (provider) => (
        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {typeLabels[provider.providerType]}
        </span>
      ),
    },
    {
      key: "performance",
      header: "Performance",
      widthClassName: "w-[18%]",
      render: (provider) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {provider.bookingsCount} bookings
          </p>
          <p className="text-xs text-gray-500">
            {formatCurrency(provider.revenueVnd)} / {provider.rating.toFixed(1)}
          </p>
        </div>
      ),
    },
    {
      key: "verification",
      header: "Verification",
      widthClassName: "w-[13%]",
      render: (provider) => (
        <VerificationBadge status={provider.verificationStatus} />
      ),
    },
    {
      key: "status",
      header: "Status",
      widthClassName: "w-[11%]",
      render: (provider) => <StatusBadge status={provider.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      isAction: true,
      widthClassName: "w-[8%]",
      render: (provider) => (
        <ActionMenu
          items={[
            {
              label: "View provider",
              onClick: () => router.push(`/admin/providers/${provider.id}`),
            },
            {
              label: "Review verification",
              onClick: () => router.push("/admin/verification"),
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
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        eyebrow="Admin / Providers"
        title="Provider Management"
        description="Manage service provider accounts, access status, verification, and performance."
      />

      <StatisticCardGrid columns={4}>
        <StatisticCard title="Total providers" value={providers.length} tone="blue" />
        <StatisticCard title="Active" value={activeCount} tone="green" />
        <StatisticCard title="Verified" value={verifiedCount} tone="purple" />
        <StatisticCard title="Suspended" value={suspendedCount} tone="red" />
      </StatisticCardGrid>

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <SearchInput
            className="w-full xl:max-w-md"
            value={search}
            placeholder="Search business, owner, email, or phone"
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
          <CustomSelect
            className="w-full sm:w-52"
            defaultValue={typeFilter}
            options={TYPE_FILTERS}
            onValueChange={(value) => {
              setTypeFilter(value as "" | ProviderType);
              setPage(1);
            }}
          />
          <CustomSelect
            className="w-full sm:w-52"
            defaultValue={statusFilter}
            options={STATUS_FILTERS}
            onValueChange={(value) => {
              setStatusFilter(value as "" | AdminAccountStatus);
              setPage(1);
            }}
          />
          <div className="text-sm font-medium text-gray-500 xl:ml-auto">
            {total} provider{total === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={records}
        getRowKey={(provider) => provider.id}
        minWidthClassName="min-w-[1180px]"
        emptyState={
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-gray-700">
              No providers found
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Try another search keyword, provider type, or status filter.
            </p>
          </div>
        }
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
      />
    </div>
  );
}
