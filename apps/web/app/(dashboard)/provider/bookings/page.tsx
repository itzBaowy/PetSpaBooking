import { BookingTable } from '@/apis/provider/bookings/components/booking-table';
import { BookingCalendar } from '@/apis/provider/bookings/components/booking-calendar';

export default function Bookings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BookingTable />
        </div>
        <div>
          <BookingCalendar />
        </div>
      </div>
    </div>
  );
}
