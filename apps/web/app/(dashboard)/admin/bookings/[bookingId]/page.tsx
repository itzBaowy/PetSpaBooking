import { AdminBookingDetailPage } from "@/components/admin/pages/booking-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <AdminBookingDetailPage id={bookingId} />
      </div>
    </main>
  );
}
