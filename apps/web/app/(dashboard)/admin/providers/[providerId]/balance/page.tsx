import { AdminProviderWalletPage } from "@/components/admin/supported-pages";
export default async function Page({ params }: { params: Promise<{ providerId: string }> }) { const { providerId } = await params; return <AdminProviderWalletPage id={providerId} />; }
