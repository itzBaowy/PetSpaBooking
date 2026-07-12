import { AdminRefundDetailPage } from "@/components/admin/supported-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <AdminRefundDetailPage bookingId={bookingId} />;
}
