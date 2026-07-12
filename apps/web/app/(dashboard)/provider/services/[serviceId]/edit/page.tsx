import { ProviderServiceFormLive } from "@/components/provider/live/provider-live-screens";

export default async function EditService({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  return (
    <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-5xl"><ProviderServiceFormLive serviceId={serviceId} /></div></main>
  );
}
