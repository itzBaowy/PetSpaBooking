import { UserDetail } from "@/apis/admin/users/components/user-detail";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { userId } = await params;

  return <UserDetail userId={userId} />;
}
