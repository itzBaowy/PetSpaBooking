import { notFound } from "next/navigation";
import { ProfilePage } from "@/apis/profile/components/profile-page";
import { profileRouteRoleSchema } from "@/apis/profile/schema";
import { DashboardRoleGuard, ProviderAccessGuard } from "@/components/guards";

interface PageProps {
  params: Promise<{ role: string }>;
}

export default async function RoleProfile({ params }: PageProps) {
  const { role } = await params;
  const parsedRole = profileRouteRoleSchema.safeParse(role);

  if (!parsedRole.success) {
    notFound();
  }

  if (parsedRole.data === "provider") {
    return (
      <DashboardRoleGuard role="provider">
        <ProviderAccessGuard>
          <ProfilePage role={parsedRole.data} />
        </ProviderAccessGuard>
      </DashboardRoleGuard>
    );
  }

  return <ProfilePage role={parsedRole.data} />;
}
