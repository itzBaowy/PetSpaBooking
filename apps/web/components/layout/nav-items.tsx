import type { SVGProps } from "react";
import {
  getProviderNavigation,
  PROVIDER_NAVIGATION_GROUP_LABELS,
  type ProviderAccessStatus,
  type ProviderNavigationGroup,
  type ProviderNavigationItemId,
} from "@/lib/provider-access";

// ─── Icon components ────────────────────────────────────────────────────────

function IconGrid(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
      />
    </svg>
  );
}

function IconUsers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function IconBuilding(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function IconClipboard(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

function IconWarning(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function IconCoin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 10v2M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
      />
    </svg>
  );
}

function IconReceipt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 14l2 2 4-4M7 4h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 012-2z"
      />
    </svg>
  );
}

function IconLog(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5h6m-8 4h10M7 13h10M7 17h6M5 3h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"
      />
    </svg>
  );
}

function IconHome(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001-1m-6 0h6"
      />
    </svg>
  );
}

function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function IconGroup(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export const adminNavGroups: NavGroup[] = [
  {
    groupLabel: "Tổng quan",
    items: [{ label: "Tổng quan", href: "/admin", icon: <IconGrid /> }],
  },
  {
    groupLabel: "Quản lý người dùng",
    items: [
      { label: "Người dùng", href: "/admin/users", icon: <IconUsers /> },
      {
        label: "Nhà cung cấp",
        href: "/admin/providers",
        icon: <IconBuilding />,
      },
    ],
  },
  {
    groupLabel: "Vận hành",
    items: [
      { label: "Đặt lịch", href: "/admin/bookings", icon: <IconClipboard /> },
      { label: "Tranh chấp", href: "/admin/bookings/disputes", icon: <IconWarning /> },
      { label: "Dịch vụ", href: "/admin/services", icon: <IconClipboard /> },
    ],
  },
  {
    groupLabel: "Tài chính",
    items: [
      { label: "Tài chính", href: "/admin/finance/ledger", icon: <IconCoin /> },
      {
        label: "Hoa hồng",
        href: "/admin/finance/commission",
        icon: <IconReceipt />,
      },
      {
        label: "Rút tiền",
        href: "/admin/finance/withdrawals",
        icon: <IconReceipt />,
      },
      {
        label: "Hoàn tiền",
        href: "/admin/finance/refunds",
        icon: <IconReceipt />,
      },
      {
        label: "Cấu hình ký quỹ",
        href: "/admin/finance/deposit-config",
        icon: <IconCoin />,
      },
    ],
  },
  {
    groupLabel: "Hệ thống",
    items: [
      { label: "Báo cáo", href: "/admin/reports", icon: <IconReceipt /> },
      { label: "Nhật ký", href: "/admin/audit-logs", icon: <IconLog /> },
    ],
  },
];

// ─── Provider nav groups ──────────────────────────────────────────────────────

const providerGroupOrder: ProviderNavigationGroup[] = [
  "overview",
  "account",
  "operations",
  "finance",
  "communication",
];

const providerIconMap: Record<ProviderNavigationItemId, React.ReactNode> = {
  dashboard: <IconHome />,
  "business-profile": <IconBuilding />,
  verification: <IconWarning />,
  availability: <IconCalendar />,
  services: <IconClipboard />,
  pricing: <IconCoin />,
  bookings: <IconCalendar />,
  customers: <IconGroup />,
  disputes: <IconWarning />,
  wallet: <IconCoin />,
  revenue: <IconReceipt />,
  withdrawals: <IconReceipt />,
  chat: <IconUsers />,
  notifications: <IconWarning />,
  reviews: <IconClipboard />,
  settings: <IconBuilding />,
};

export function getProviderNavGroups(status: ProviderAccessStatus): NavGroup[] {
  const allowedItems = getProviderNavigation(status);

  return providerGroupOrder.flatMap((group) => {
    const items = allowedItems
      .filter((item) => item.group === group)
      .map((item) => ({
        label: item.label,
        href: item.href,
        icon: providerIconMap[item.id],
      }));

    return items.length > 0
      ? [{ groupLabel: PROVIDER_NAVIGATION_GROUP_LABELS[group], items }]
      : [];
  });
}

export const providerNavGroups = getProviderNavGroups("VERIFIED");

// ─── Legacy flat exports (kept for backward-compat if any consumer still uses them) ─

export const adminNavItems = adminNavGroups.flatMap((g) => g.items);
export const providerNavItems = providerNavGroups.flatMap((g) => g.items);
