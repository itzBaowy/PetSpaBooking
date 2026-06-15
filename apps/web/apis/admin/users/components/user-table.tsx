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
import type { AdminAccountRole, AdminAccountStatus } from "../schema";
import { useAdminUsers } from "../queries";
import type { AdminUserAccount } from "../queries";

const ROLE_FILTERS: Array<{ label: string; value: "" | AdminAccountRole }> = [
  { label: "All roles", value: "" },
  { label: "Pet Owners", value: "PET_OWNER" },
  { label: "Service Providers", value: "SERVICE_PROVIDER" },
  { label: "Admins", value: "ADMIN" },
];

const STATUS_FILTERS: Array<{ label: string; value: "" | AdminAccountStatus }> =
  [
    { label: "All statuses", value: "" },
    { label: "Active", value: "ACTIVE" },
    { label: "Suspended", value: "SUSPENDED" },
  ];

const roleLabels: Record<AdminAccountRole, string> = {
  PET_OWNER: "Pet Owner",
  SERVICE_PROVIDER: "Service Provider",
  ADMIN: "Admin",
};

const statusLabels: Record<AdminAccountStatus, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function RoleBadge({ role }: { role: AdminAccountRole }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        role === "PET_OWNER" && "border-blue-200 bg-blue-50 text-blue-700",
        role === "SERVICE_PROVIDER" &&
          "border-purple-200 bg-purple-50 text-purple-700",
        role === "ADMIN" && "border-slate-200 bg-slate-50 text-slate-700",
      )}
    >
      {roleLabels[role]}
    </span>
  );
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

function createStatusPayload(account: AdminUserAccount) {
  const nextStatus: AdminAccountStatus =
    account.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  if (nextStatus === "ACTIVE") {
    const reason = window.prompt("Reason for unlocking this account:");
    if (!reason) return null;

    return accountStatusActionSchema.safeParse({
      accountId: account.id,
      role: account.role,
      status: nextStatus,
      reason,
      durationType: "PERMANENT",
    });
  }

  const reason = window.prompt("Reason for suspending this account:");
  if (!reason) return null;

  const days = window.prompt(
    "Temporary suspension duration in days. Leave blank for permanent suspension:",
  );
  const durationDays = days ? Number(days) : undefined;

  return accountStatusActionSchema.safeParse({
    accountId: account.id,
    role: account.role,
    status: nextStatus,
    reason,
    durationType: durationDays ? "TEMPORARY" : "PERMANENT",
    durationDays,
  });
}

export function UserTable() {
  const router = useRouter();
  const { data: accounts } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | AdminAccountRole>("");
  const [statusFilter, setStatusFilter] = useState<"" | AdminAccountStatus>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const debouncedSearch = useDebounce(search, 300);

  const filteredAccounts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return accounts.filter((account) => {
      if (roleFilter && account.role !== roleFilter) return false;
      if (statusFilter && account.status !== statusFilter) return false;
      if (!query) return true;

      return [
        account.id,
        account.name,
        account.email,
        account.phone,
        roleLabels[account.role],
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [accounts, debouncedSearch, roleFilter, statusFilter]);

  const total = filteredAccounts.length;
  const totalPages = Math.ceil(total / pageSize);
  const records = filteredAccounts.slice((page - 1) * pageSize, page * pageSize);

  const totalPetOwners = accounts.filter(
    (account) => account.role === "PET_OWNER",
  ).length;
  const totalProviders = accounts.filter(
    (account) => account.role === "SERVICE_PROVIDER",
  ).length;
  const suspendedCount = accounts.filter(
    (account) => account.status === "SUSPENDED",
  ).length;

  const handleStatusAction = (account: AdminUserAccount) => {
    const result = createStatusPayload(account);
    if (!result) return;

    if (!result.success) {
      window.alert(result.error.issues[0]?.message ?? "Invalid status action.");
      return;
    }

    window.alert(
      `${account.name} status would be changed to ${statusLabels[result.data.status]} (mock).`,
    );
  };

  const columns: Array<DataTableColumn<AdminUserAccount>> = [
    {
      key: "profile",
      header: "Profile",
      widthClassName: "w-[24%]",
      render: (account) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
            {account.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="wrap-break-word text-sm font-semibold text-gray-950">
              {account.name}
            </p>
            <p className="text-xs font-medium text-gray-500">{account.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      widthClassName: "w-[22%]",
      render: (account) => (
        <div className="min-w-0">
          <p className="wrap-break-word text-sm text-gray-900">
            {account.email}
          </p>
          <p className="text-xs text-gray-500">{account.phone}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      widthClassName: "w-[14%]",
      render: (account) => <RoleBadge role={account.role} />,
    },
    {
      key: "activity",
      header: "Activity",
      widthClassName: "w-[18%]",
      render: (account) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {account.bookings} bookings
          </p>
          <p className="text-xs text-gray-500">
            {formatCurrency(account.totalSpendVnd)}
          </p>
        </div>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      widthClassName: "w-[12%]",
      render: (account) => (
        <span className="text-sm text-gray-700">
          {formatDate(account.joinedAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      widthClassName: "w-[12%]",
      render: (account) => <StatusBadge status={account.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      isAction: true,
      widthClassName: "w-[8%]",
      render: (account) => (
        <ActionMenu
          items={[
            {
              label: "View account",
              onClick: () => router.push(`/admin/users/${account.id}`),
            },
            {
              label:
                account.status === "ACTIVE"
                  ? "Suspend account"
                  : "Unlock account",
              onClick: () => handleStatusAction(account),
              variant: account.status === "ACTIVE" ? "danger" : "default",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        eyebrow="Admin / Accounts"
        title="User Management"
        description="Manage platform participants, roles, access status, and ban actions."
      />

      <StatisticCardGrid columns={4}>
        <StatisticCard title="Total accounts" value={accounts.length} tone="blue" />
        <StatisticCard title="Pet owners" value={totalPetOwners} tone="green" />
        <StatisticCard
          title="Service providers"
          value={totalProviders}
          tone="purple"
        />
        <StatisticCard title="Suspended" value={suspendedCount} tone="red" />
      </StatisticCardGrid>

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <SearchInput
            className="w-full xl:max-w-md"
            value={search}
            placeholder="Search name, email, phone, or ID"
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
          <CustomSelect
            className="w-full sm:w-52"
            defaultValue={roleFilter}
            options={ROLE_FILTERS}
            onValueChange={(value) => {
              setRoleFilter(value as "" | AdminAccountRole);
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
            {total} account{total === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={records}
        getRowKey={(account) => account.id}
        minWidthClassName="min-w-[1180px]"
        emptyState={
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-gray-700">
              No accounts found
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Try another search keyword, role, or status filter.
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
