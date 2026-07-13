"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { ThemeMenuItem } from "@/components/ui/theme-menu-item";
import { TopbarIcon } from "./topbar-icons";
import type { DashboardTopbarRole } from "./types";

interface ProfileMenuProps {
  role: DashboardTopbarRole;
  displayName: string;
  displayEmail: string;
  displayRole: string;
  avatar?: string | null;
  initials: string;
  onLogout: () => void;
}

export function ProfileMenu({
  role,
  displayName,
  displayEmail,
  displayRole,
  avatar,
  initials,
  onLogout,
}: ProfileMenuProps) {
  return (
    <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-xl border border-border-subtle bg-surface text-foreground shadow-xl">
      <div className="border-b border-border-subtle p-4">
        <div className="flex items-center gap-3">
          <Avatar src={avatar} alt={displayName} fallback={initials} size="list" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{displayName}</p>
            <p className="truncate text-xs text-muted">{displayEmail}</p>
            <p className="mt-1 text-xs font-semibold text-brand">{displayRole}</p>
          </div>
        </div>
      </div>
      <div className="space-y-0.5 p-1.5">
        <Link
          href={`/${role}/profile`}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-brand-soft hover:text-brand"
        >
          <TopbarIcon type="user" /> Hồ sơ
        </Link>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground transition hover:bg-brand-soft hover:text-brand"
        >
          <TopbarIcon type="activity" /> Nhật ký hoạt động
        </button>
        <ThemeMenuItem />
        <div className="my-1 border-t border-border-subtle" />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-danger transition hover:bg-danger-soft"
        >
          <TopbarIcon type="logout" /> Đăng xuất
        </button>
      </div>
    </div>
  );
}
