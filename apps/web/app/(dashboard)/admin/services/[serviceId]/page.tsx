import { AdminServiceDetailPage } from "@/components/admin/pages/service-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <AdminServiceDetailPage id={serviceId} />
      </div>
    </main>
  );
}
