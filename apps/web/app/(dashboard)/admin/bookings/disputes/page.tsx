import { DisputeTable } from '@/apis/admin/bookings/components/dispute-table';

export default function Disputes() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Booking Disputes</h1>
      <DisputeTable />
    </div>
  );
}
