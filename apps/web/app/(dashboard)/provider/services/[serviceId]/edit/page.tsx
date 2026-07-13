import { ProviderServiceFormPage } from "@/apis/provider/services/components/provider-service-form-page";

export default async function EditService({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  return (
    <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-5xl"><ProviderServiceFormPage serviceId={serviceId} /></div></main>
  );
}
