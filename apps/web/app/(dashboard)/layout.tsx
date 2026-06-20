"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isAdmin = pathname.startsWith("/admin");
  const isProvider = pathname.startsWith("/provider");

  const adminNavItems: NavItem[] = [
    {
      label: "Tổng quan",
      href: "/admin",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
          />
        </svg>
      ),
    },
    {
      label: "Người dùng",
      href: "/admin/users",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      label: "Nhà cung cấp",
      href: "/admin/providers",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      label: "Đặt lịch",
      href: "/admin/bookings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    // {
    //   label: "Disputes",
    //   href: "/admin/bookings/disputes",
    //   icon: (
    //     <svg
    //       className="w-5 h-5"
    //       fill="none"
    //       viewBox="0 0 24 24"
    //       stroke="currentColor"
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
    //       />
    //     </svg>
    //   ),
    // },
    {
      label: "Xác thực",
      href: "/admin/verification",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      label: "Kiểm duyệt",
      href: "/admin/moderation",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    // {
    //   label: "Service Review",
    //   href: "/admin/moderation/services",
    //   icon: (
    //     <svg
    //       className="w-5 h-5"
    //       fill="none"
    //       viewBox="0 0 24 24"
    //       stroke="currentColor"
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M9 12l2 2 4-4M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
    //       />
    //     </svg>
    //   ),
    // },
    {
      label: "Marketing",
      href: "/admin/marketing",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5.882V19.24a1.76 1.76 0 01-2.64 1.526l-3.016-1.742A2.5 2.5 0 014 16.86V8.118a2.5 2.5 0 011.344-2.164L8.36 4.212A1.76 1.76 0 0111 5.882zm0 0l7.5-2.5A1.5 1.5 0 0120 4.805v14.39a1.5 1.5 0 01-1.5 1.423L11 18.118"
          />
        </svg>
      ),
    },
    {
      label: "Tài chính",
      href: "/admin/finance/ledger",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 10v2M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
          />
        </svg>
      ),
    },
    {
      label: "Hoa hồng",
      href: "/admin/finance/commission",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 14l2 2 4-4M7 4h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 012-2z"
          />
        </svg>
      ),
    },
    {
      label: "Nhật ký",
      href: "/admin/audit-logs",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5h6m-8 4h10M7 13h10M7 17h6M5 3h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"
          />
        </svg>
      ),
    },
  ];

  const providerNavItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/provider",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001-1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: "Services",
      href: "/provider/services",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      label: "Bookings",
      href: "/provider/bookings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      label: "Customers",
      href: "/provider/customers",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  const currentNav = isAdmin
    ? adminNavItems
    : isProvider
      ? providerNavItems
      : [];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar navigation */}
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col border-r border-shell-border bg-shell text-brand-foreground transition-all duration-200",
          isSidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center gap-3 border-b border-shell-border bg-shell-strong",
            isSidebarCollapsed ? "justify-center px-3" : "justify-between px-6",
          )}
        >
          {!isSidebarCollapsed && (
            <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              {isAdmin
                ? "Quản trị PetLink"
                : isProvider
                  ? "Trung tâm Nhà cung cấp"
                  : "Bảng điều khiển PetLink"}
            </span>
          )}
          <button
            type="button"
            aria-label={
              isSidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"
            }
            title={isSidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-shell-border bg-shell-strong/40 text-shell-muted transition-colors hover:bg-shell-border hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isSidebarCollapsed ? (
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5v14"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 8l4 4-4 4"
                  />
                </>
              ) : (
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 5v14"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 8l-4 4 4 4"
                  />
                </>
              )}
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1.5">
            {currentNav.map((item) => {
              const hasMoreSpecificActiveItem = currentNav.some(
                (navItem) =>
                  navItem.href !== item.href &&
                  navItem.href.startsWith(`${item.href}/`) &&
                  pathname.startsWith(navItem.href),
              );
              const isActive =
                item.href === "/admin" || item.href === "/provider"
                  ? pathname === item.href
                  : (pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)) &&
                    !hasMoreSpecificActiveItem;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg py-3 text-sm font-semibold transition-all duration-150",
                      isSidebarCollapsed
                        ? "justify-center px-3"
                        : "justify-start px-4",
                      isActive
                        ? "bg-brand text-brand-foreground shadow-md shadow-blue-900/20"
                        : "text-shell-muted hover:bg-shell-border/60 hover:text-brand-foreground",
                    )}
                  >
                    {item.icon}
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
            {currentNav.length === 0 && !isSidebarCollapsed && (
              <li className="py-4 text-center text-sm text-shell-muted">
                Chưa có mục điều hướng
              </li>
            )}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background">
        {(isAdmin || isProvider) && (
          <DashboardTopbar role={isAdmin ? "admin" : "provider"} />
        )}
        <div className="min-w-0 flex-1">{children}</div>
      </main>
    </div>
  );
}
