import { AdminProviderDetailPage } from "@/components/admin/supported-pages";
export default async function Page({ params }: { params: Promise<{ providerId: string }> }) { const { providerId } = await params; return <AdminProviderDetailPage id={providerId} />; }
