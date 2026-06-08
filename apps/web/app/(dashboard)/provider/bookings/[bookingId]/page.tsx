import { BookingDetail } from '@/apis/provider/bookings/components/booking-detail';

export default function BookingDetailPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Booking Details</h1>
      <BookingDetail />
    </div>
  );
}
