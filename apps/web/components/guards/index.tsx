"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfile } from "@/apis/auth/queries";
import { ProviderAccessDenied } from "@/components/provider/provider-access-denied";
import { getProviderRouteAccess } from "@/lib/provider-access";
import { useAuthStore } from "@/stores/auth-store";

type AppRole = "ADMIN" | "PROVIDER" | "CUSTOMER";

const routeRoleMap = {
  admin: "ADMIN",
  provider: "PROVIDER",
} as const satisfies Record<string, AppRole>;

const roleHomePath: Record<AppRole, string> = {
  ADMIN: "/admin",
  PROVIDER: "/provider",
  CUSTOMER: "/",
};

export function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const profileQuery = useProfile();

  useEffect(() => {
    if (!accessToken) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [accessToken, pathname, router]);

  useEffect(() => {
    if (!profileQuery.error) return;

    clearTokens();
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [clearTokens, pathname, profileQuery.error, router]);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile || !allowedRoles?.length) return;

    const roleAllowed = allowedRoles.includes(profile.role as AppRole);
    if (!roleAllowed) {
      router.replace(roleHomePath[profile.role as AppRole] ?? "/login");
    }
  }, [allowedRoles, profileQuery.data, router]);

  if (!accessToken || profileQuery.isLoading || profileQuery.isFetching) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm font-semibold text-muted">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  const profile = profileQuery.data;
  const roleAllowed =
    !allowedRoles?.length || allowedRoles.includes(profile?.role as AppRole);

  if (!roleAllowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm font-semibold text-muted">
        Đang chuyển hướng theo quyền tài khoản...
      </div>
    );
  }

  return <>{children}</>;
}

export function ProviderAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/provider";
  const profileQuery = useProfile();
  const access = getProviderRouteAccess(
    pathname,
    profileQuery.data?.providerStatus,
  );

  if (profileQuery.isLoading || profileQuery.isFetching) {
    return (
      <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-background text-sm font-semibold text-muted">
        Đang kiểm tra quyền truy cập nhà cung cấp...
      </div>
    );
  }

  if (!access.allowed) {
    return (
      <ProviderAccessDenied
        reason={access.reason ?? "Bạn không có quyền truy cập trang này."}
      />
    );
  }

  return <>{children}</>;
}

export function DashboardRoleGuard({
  children,
  role,
}: {
  children: React.ReactNode;
  role: keyof typeof routeRoleMap;
}) {
  return <AuthGuard allowedRoles={[routeRoleMap[role]]}>{children}</AuthGuard>;
}

export const GuardComponents = {
  AuthGuard,
  DashboardRoleGuard,
  ProviderAccessGuard,
};
