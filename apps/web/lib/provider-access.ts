import type { ProviderStatus } from "@/types/auth";

export type ProviderAccessStatus =
  | ProviderStatus
  | "PENDING"
  | "APPROVED"
  | null
  | undefined;

export type ProviderNavigationGroup =
  | "overview"
  | "account"
  | "operations"
  | "finance"
  | "communication";

export type ProviderNavigationItemId =
  | "dashboard"
  | "business-profile"
  | "verification"
  | "availability"
  | "services"
  | "pricing"
  | "bookings"
  | "customers"
  | "disputes"
  | "wallet"
  | "revenue"
  | "withdrawals"
  | "chat"
  | "notifications"
  | "reviews"
  | "settings";

export interface ProviderNavigationDefinition {
  id: ProviderNavigationItemId;
  label: string;
  href: string;
  group: ProviderNavigationGroup;
  limitedAccess: boolean;
}

export interface ProviderRouteAccess {
  allowed: boolean;
  reason?: string;
  fallbackHref: string;
}

export const PROVIDER_NAVIGATION_GROUP_LABELS: Record<
  ProviderNavigationGroup,
  string
> = {
  overview: "Tổng quan",
  account: "Tài khoản & hồ sơ",
  operations: "Vận hành",
  finance: "Tài chính",
  communication: "Tương tác",
};

export const PROVIDER_NAVIGATION: readonly ProviderNavigationDefinition[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/provider",
    group: "overview",
    limitedAccess: true,
  },
  {
    id: "business-profile",
    label: "Business Profile",
    href: "/provider/business-profile",
    group: "account",
    limitedAccess: true,
  },
  {
    id: "verification",
    label: "Verification",
    href: "/provider/verification",
    group: "account",
    limitedAccess: true,
  },
  {
    id: "availability",
    label: "Availability",
    href: "/provider/availability",
    group: "account",
    limitedAccess: false,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/provider/profile",
    group: "account",
    limitedAccess: true,
  },
  {
    id: "services",
    label: "Services",
    href: "/provider/services",
    group: "operations",
    limitedAccess: false,
  },
  {
    id: "pricing",
    label: "Pricing",
    href: "/provider/pricing",
    group: "operations",
    limitedAccess: false,
  },
  {
    id: "bookings",
    label: "Bookings",
    href: "/provider/bookings",
    group: "operations",
    limitedAccess: false,
  },
  {
    id: "customers",
    label: "Customers",
    href: "/provider/customers",
    group: "operations",
    limitedAccess: false,
  },
  {
    id: "disputes",
    label: "Disputes",
    href: "/provider/disputes",
    group: "operations",
    limitedAccess: false,
  },
  {
    id: "wallet",
    label: "Wallet",
    href: "/provider/wallet",
    group: "finance",
    limitedAccess: false,
  },
  {
    id: "revenue",
    label: "Revenue",
    href: "/provider/revenue",
    group: "finance",
    limitedAccess: false,
  },
  {
    id: "withdrawals",
    label: "Withdrawals",
    href: "/provider/withdrawals",
    group: "finance",
    limitedAccess: false,
  },
  {
    id: "chat",
    label: "Chat",
    href: "/provider/communication/chat",
    group: "communication",
    limitedAccess: false,
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/provider/communication/notifications",
    group: "communication",
    limitedAccess: true,
  },
  {
    id: "reviews",
    label: "Reviews",
    href: "/provider/communication/reviews",
    group: "communication",
    limitedAccess: false,
  },
] as const;

function getStatusAccessLevel(status: ProviderAccessStatus) {
  if (status === "VERIFIED" || status === "APPROVED") return "approved";
  if (
    status === "PENDING_VERIFICATION" ||
    status === "PENDING" ||
    status === "REJECTED" ||
    status === "SUSPENDED"
  ) {
    return "limited";
  }

  return "unknown";
}

export function getProviderNavigation(
  status: ProviderAccessStatus,
): readonly ProviderNavigationDefinition[] {
  const accessLevel = getStatusAccessLevel(status);
  if (accessLevel === "approved") return PROVIDER_NAVIGATION;
  if (accessLevel === "limited") {
    return PROVIDER_NAVIGATION.filter((item) => item.limitedAccess);
  }
  return [];
}

function routeMatches(pathname: string, href: string) {
  if (href === "/provider") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getProviderRouteAccess(
  pathname: string,
  status: ProviderAccessStatus,
): ProviderRouteAccess {
  const route = [...PROVIDER_NAVIGATION]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => routeMatches(pathname, item.href));

  if (!route) {
    return {
      allowed: false,
      reason: "Route này không thuộc phạm vi truy cập của nhà cung cấp.",
      fallbackHref: "/provider",
    };
  }

  const accessLevel = getStatusAccessLevel(status);
  if (accessLevel === "approved") {
    return { allowed: true, fallbackHref: "/provider" };
  }

  if (accessLevel === "limited" && route.limitedAccess) {
    return { allowed: true, fallbackHref: "/provider" };
  }

  if (accessLevel === "unknown") {
    return {
      allowed: false,
      reason:
        "Không xác định được trạng thái hồ sơ nhà cung cấp từ phiên đăng nhập.",
      fallbackHref: "/provider",
    };
  }

  const statusReason =
    status === "SUSPENDED"
      ? "Tài khoản nhà cung cấp đang bị tạm ngưng và chỉ có quyền xem các trang tài khoản được cho phép."
      : "Hồ sơ nhà cung cấp chưa được phê duyệt và chưa thể sử dụng chức năng vận hành.";

  return {
    allowed: false,
    reason: statusReason,
    fallbackHref: "/provider",
  };
}
