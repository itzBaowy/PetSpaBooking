import { DashboardRoleGuard } from "@/components/guards";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardRoleGuard role="admin">
      <div className="admin-workspace relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_28rem)]">
        <div className="pointer-events-none absolute right-8 top-8 h-40 w-40 rounded-full border-[28px] border-emerald-100/40" />
        <div className="relative mx-auto w-full max-w-[1720px] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </DashboardRoleGuard>
  );
}
