import { ServiceForm } from "@/components/provider/services/service-form";

export default async function EditService({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  return (
    <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-5xl"><ServiceForm mode="edit" serviceId={serviceId} /></div></main>
  );
}
