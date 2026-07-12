import { AdminServiceDetailPage } from "@/components/admin/supported-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  return <AdminServiceDetailPage id={serviceId} />;
}
