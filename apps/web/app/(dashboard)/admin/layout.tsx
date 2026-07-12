import { DashboardRoleGuard } from "@/components/guards";
import { AdminProviderMockProvider } from "@/components/admin/providers/admin-provider-mock-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardRoleGuard role="admin"><AdminProviderMockProvider>{children}</AdminProviderMockProvider></DashboardRoleGuard>;
}
