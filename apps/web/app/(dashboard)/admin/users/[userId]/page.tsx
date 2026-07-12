import { AdminUserDetailPage } from "@/components/admin/supported-pages";
export default async function Page({ params }: { params: Promise<{ userId: string }> }) { const { userId } = await params; return <AdminUserDetailPage id={userId} />; }
