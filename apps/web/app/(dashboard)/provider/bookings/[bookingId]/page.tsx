import { ProviderBookingDetailMock } from "@/components/provider/bookings/booking-detail";

export default async function BookingDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return (
    <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl"><ProviderBookingDetailMock bookingId={bookingId} /></div></main>
  );
}
