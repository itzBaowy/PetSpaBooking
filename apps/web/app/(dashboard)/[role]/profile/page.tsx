import { notFound } from "next/navigation";
import { ProfilePage } from "@/apis/profile/components/profile-page";
import { profileRouteRoleSchema } from "@/apis/profile/schema";

interface PageProps {
  params: Promise<{ role: string }>;
}

export default async function RoleProfile({ params }: PageProps) {
  const { role } = await params;
  const parsedRole = profileRouteRoleSchema.safeParse(role);

  if (!parsedRole.success) {
    notFound();
  }

  return <ProfilePage role={parsedRole.data} />;
}
