"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const isAdmin = pathname.startsWith("/admin");
  const isProvider = pathname.startsWith("/provider");

  const dashboard = (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DashboardSidebar />

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background">
        {(isAdmin || isProvider) && (
          <DashboardTopbar role={isAdmin ? "admin" : "provider"} />
        )}
        <div className="min-w-0 flex-1">{children}</div>
      </main>
    </div>
  );

  return dashboard;
}
