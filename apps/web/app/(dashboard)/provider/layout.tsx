import { DashboardRoleGuard, ProviderAccessGuard } from "@/components/guards";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardRoleGuard role="provider">
      <ProviderAccessGuard>{children}</ProviderAccessGuard>
    </DashboardRoleGuard>
  );
}
