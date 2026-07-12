import { DashboardRoleGuard } from "@/components/guards";
import { AdminProviderMockProvider } from "@/components/admin/providers/admin-provider-mock-context";
import { AdminServiceMockProvider } from "@/components/admin/services/admin-service-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardRoleGuard role="admin"><AdminProviderMockProvider><AdminServiceMockProvider>{children}</AdminServiceMockProvider></AdminProviderMockProvider></DashboardRoleGuard>;
}
