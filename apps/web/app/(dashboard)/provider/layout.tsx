import { DashboardRoleGuard } from "@/components/guards";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardRoleGuard role="provider">{children}</DashboardRoleGuard>;
}
