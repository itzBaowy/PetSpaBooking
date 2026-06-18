import { SystemBookingTable } from "@/apis/admin/bookings/components/system-booking-table";

export default function AdminBookings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Bookings</h1>
      <SystemBookingTable />
    </div>
  );
}
