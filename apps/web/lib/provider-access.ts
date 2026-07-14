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
  | "bookings"
  | "customers"
  | "disputes"
  | "wallet"
  | "revenue"
  | "withdrawals"
  | "chat"
  | "reviews";

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

export const PROVIDER_NAVIGATION_GROUP_LABELS: Record<ProviderNavigationGroup, string> = {
  overview: "Tổng quan",
  account: "Tài khoản & hồ sơ",
  operations: "Vận hành",
  finance: "Tài chính",
  communication: "Tương tác",
};

export const PROVIDER_NAVIGATION: readonly ProviderNavigationDefinition[] = [
  { id: "dashboard", label: "Tổng quan", href: "/provider", group: "overview", limitedAccess: true },
  { id: "business-profile", label: "Hồ sơ kinh doanh", href: "/provider/business-profile", group: "account", limitedAccess: true },
  { id: "verification", label: "Xác minh", href: "/provider/verification", group: "account", limitedAccess: true },
  { id: "availability", label: "Lịch làm việc", href: "/provider/availability", group: "account", limitedAccess: false },
  { id: "services", label: "Dịch vụ", href: "/provider/services", group: "operations", limitedAccess: false },
  { id: "bookings", label: "Đặt lịch", href: "/provider/bookings", group: "operations", limitedAccess: false },
  { id: "customers", label: "Khách hàng", href: "/provider/customers", group: "operations", limitedAccess: false },
  { id: "disputes", label: "Tranh chấp", href: "/provider/disputes", group: "operations", limitedAccess: false },
  { id: "wallet", label: "Ví", href: "/provider/wallet", group: "finance", limitedAccess: false },
  { id: "revenue", label: "Doanh thu", href: "/provider/revenue", group: "finance", limitedAccess: false },
  { id: "withdrawals", label: "Rút tiền", href: "/provider/withdrawals", group: "finance", limitedAccess: false },
  { id: "chat", label: "Tin nhắn", href: "/provider/communication/chat", group: "communication", limitedAccess: false },
  { id: "reviews", label: "Đánh giá", href: "/provider/communication/reviews", group: "communication", limitedAccess: false },
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

export function getProviderNavigation(status: ProviderAccessStatus): readonly ProviderNavigationDefinition[] {
  const accessLevel = getStatusAccessLevel(status);
  if (accessLevel === "approved") return PROVIDER_NAVIGATION;
  if (accessLevel === "limited") return PROVIDER_NAVIGATION.filter((item) => item.limitedAccess);
  return [];
}

function routeMatches(pathname: string, href: string) {
  if (href === "/provider") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getProviderRouteAccess(pathname: string, status: ProviderAccessStatus): ProviderRouteAccess {
  const accessLevel = getStatusAccessLevel(status);

  if (routeMatches(pathname, "/provider/profile")) {
    if (accessLevel === "unknown") {
      return {
        allowed: false,
        reason: "Không xác định được trạng thái hồ sơ nhà cung cấp từ phiên đăng nhập.",
        fallbackHref: "/provider",
      };
    }

    return { allowed: true, fallbackHref: "/provider" };
  }

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

  if (accessLevel === "approved") return { allowed: true, fallbackHref: "/provider" };
  if (accessLevel === "limited" && route.limitedAccess) {
    return { allowed: true, fallbackHref: "/provider" };
  }
  if (accessLevel === "unknown") {
    return {
      allowed: false,
      reason: "Không xác định được trạng thái hồ sơ nhà cung cấp từ phiên đăng nhập.",
      fallbackHref: "/provider",
    };
  }

  return {
    allowed: false,
    reason:
      status === "SUSPENDED"
        ? "Tài khoản nhà cung cấp đang bị tạm ngưng và chỉ có quyền xem các trang tài khoản được cho phép."
        : "Hồ sơ nhà cung cấp chưa được phê duyệt và chưa thể sử dụng chức năng vận hành.",
    fallbackHref: "/provider",
  };
}
