import { AdminProviderDetailMock } from "@/components/admin/providers/admin-provider-screens";
export default async function Page({ params }: { params: Promise<{ verificationId: string }> }) { const { verificationId } = await params; return <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl"><AdminProviderDetailMock id={verificationId} verificationMode /></div></main>; }
