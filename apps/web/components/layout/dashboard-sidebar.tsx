"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useProfile } from "@/apis/auth/queries";
import { cn } from "@/lib/utils";
import {
  adminNavGroups,
  getProviderNavGroups,
  type NavGroup,
} from "@/components/layout/nav-items";

// ─── Chevron icon ─────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={cn(
        "h-3 w-3 shrink-0 transition-transform duration-200",
        open ? "rotate-0" : "-rotate-90",
      )}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="m19 9-7 7-7-7"
      />
    </svg>
  );
}

// ─── Collapse / expand toggle icon ───────────────────────────────────────────

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {collapsed ? (
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
  );
}

// ─── Main sidebar component ───────────────────────────────────────────────────

export function DashboardSidebar() {
  const pathname = usePathname() || "";
  const profileQuery = useProfile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Set of group labels that are manually collapsed by the user
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const isAdmin = pathname.startsWith("/admin");
  const isProvider = pathname.startsWith("/provider");

  const currentGroups: NavGroup[] = isAdmin
    ? adminNavGroups
    : isProvider
      ? getProviderNavGroups(profileQuery.data?.providerStatus)
      : [];

  // Flatten all items for the active-link resolution logic
  const allItems = currentGroups.flatMap((g) => g.items);

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col bg-shell text-brand-foreground transition-all duration-200",
        isSidebarCollapsed ? "w-20" : "w-60",
      )}
    >
      {/* ── Header / logo ── */}
      <div
        className={cn(
          "group relative flex h-16 items-center border-b border-shell-border bg-shell-strong transition-all duration-200",
          isSidebarCollapsed
            ? "justify-center px-3"
            : "justify-between px-4 gap-3",
        )}
      >
        {!isSidebarCollapsed ? (
          <>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-brand dark:text-white">
                {isAdmin
                  ? "Quản trị PetLink"
                  : isProvider
                    ? "Trung tâm Nhà cung cấp"
                    : "Bảng điều khiển PetLink"}
              </p>
              <p className="mt-0.5 truncate text-[11px] font-medium text-muted dark:text-shell-muted">
                {isAdmin
                  ? "Cổng quản trị"
                  : isProvider
                    ? "Cổng nhà cung cấp"
                    : "Cổng quản lý"}
              </p>
            </div>
            <button
              type="button"
              aria-label="Thu gọn menu"
              title="Thu gọn menu"
              onClick={() => setIsSidebarCollapsed(true)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:text-shell-muted dark:hover:bg-shell-border dark:hover:text-white"
            >
              <CollapseIcon collapsed={false} />
            </button>
          </>
        ) : (
          <div className="relative flex h-9 w-9 items-center justify-center shrink-0">
            {/* Logo shown by default, hidden on hover */}
            <div className="relative h-9 w-9 transition-opacity duration-200 group-hover:opacity-0 group-hover:pointer-events-none">
              <Image
                src="/brand/petlink-logo.png"
                alt="PetLink"
                fill
                sizes="36px"
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/brand/petlink-logo-dark.png"
                alt=""
                fill
                sizes="36px"
                className="hidden object-contain dark:block"
                priority
              />
            </div>
            {/* Expand button absolute centered, shown only on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto">
              <button
                type="button"
                aria-label="Mở rộng menu"
                title="Mở rộng menu"
                onClick={() => setIsSidebarCollapsed(false)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface border border-shell-border text-muted transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:bg-shell dark:text-shell-muted dark:hover:bg-shell-border dark:hover:text-white shadow-sm"
              >
                <CollapseIcon collapsed={true} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Nav groups ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {currentGroups.length === 0 && !isSidebarCollapsed && (
          <p className="py-4 text-center text-sm text-shell-muted">
            Chưa có mục điều hướng
          </p>
        )}

        {currentGroups.map((group, groupIdx) => {
          const isGroupCollapsed = collapsedGroups.has(group.groupLabel);

          return (
            <div key={group.groupLabel}>
              {/* Divider between groups (not before the first) */}
              {groupIdx > 0 && (
                <div className="my-2 border-t border-shell-border/60" />
              )}

              {/* Group header — hidden when sidebar is icon-only */}
              {!isSidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.groupLabel)}
                  className="mb-1 flex w-full items-center justify-between gap-1 px-2 py-1 text-left transition-colors hover:text-foreground focus-visible:outline-none"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted dark:text-shell-muted">
                    {group.groupLabel}
                  </span>
                  <ChevronIcon open={!isGroupCollapsed} />
                </button>
              )}

              {/* Group items — collapsed per-group only applies when sidebar is expanded */}
              {(!isGroupCollapsed || isSidebarCollapsed) && (
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const hasMoreSpecificActiveItem = allItems.some(
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
                            "flex min-h-10 items-center gap-3 rounded-md border-l-[3px] border-y-0 border-r-0 py-2.5 text-sm font-medium transition-all duration-150",
                            isSidebarCollapsed
                              ? "justify-center px-3"
                              : "justify-start px-4",
                            isActive
                              ? "border-l-brand bg-brand-soft text-green-700 dark:bg-brand dark:text-brand-foreground"
                              : "border-l-transparent text-shell-muted hover:bg-surface-muted hover:text-foreground dark:hover:bg-shell-border/60 dark:hover:text-brand-foreground",
                          )}
                        >
                          {item.icon}
                          {!isSidebarCollapsed && (
                            <span className="flex flex-1 items-center justify-between gap-2">
                              <span>{item.label}</span>
                              {item.badge !== undefined && item.badge > 0 && (
                                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-brand-foreground">
                                  {item.badge}
                                </span>
                              )}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
