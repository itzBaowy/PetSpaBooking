import { AdminServiceDetailMock } from "@/components/admin/services/admin-service-screens";
export default async function Page({ params }: { params: Promise<{ serviceId: string }> }) { const { serviceId } = await params; return <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl"><AdminServiceDetailMock id={serviceId} /></div></main>; }
