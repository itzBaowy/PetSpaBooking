import { DashboardRoleGuard } from "@/components/guards";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardRoleGuard role="admin">{children}</DashboardRoleGuard>;
}
