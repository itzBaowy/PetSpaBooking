import { ProviderBookingDetailPage } from "@/apis/provider/bookings/components/provider-booking-detail-page";

export default async function BookingDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return (
    <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl"><ProviderBookingDetailPage bookingId={bookingId} /></div></main>
  );
}
