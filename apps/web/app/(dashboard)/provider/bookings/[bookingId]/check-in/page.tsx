import { BookingCheckInMock } from "@/components/provider/bookings/qr-otp-checkin";

export default async function BookingCheckInPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-5xl"><BookingCheckInMock bookingId={bookingId} /></div></main>;
}
