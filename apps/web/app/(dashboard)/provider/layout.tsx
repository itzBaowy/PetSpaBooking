import { DashboardRoleGuard, ProviderAccessGuard } from "@/components/guards";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardRoleGuard role="provider">
      <ProviderAccessGuard>
        <div className="min-h-full bg-gradient-to-b from-emerald-50/50 via-slate-50 to-white">
          {children}
        </div>
      </ProviderAccessGuard>
    </DashboardRoleGuard>
  );
}
