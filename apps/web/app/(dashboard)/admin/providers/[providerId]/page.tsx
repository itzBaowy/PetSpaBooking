import { AdminProviderDetailMock } from "@/components/admin/providers/admin-provider-screens";
export default async function Page({ params }: { params: Promise<{ providerId: string }> }) { const { providerId } = await params; return <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl"><AdminProviderDetailMock id={providerId} /></div></main>; }
