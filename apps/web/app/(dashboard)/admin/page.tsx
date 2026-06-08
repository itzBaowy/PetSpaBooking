import { PlatformSummaryCards } from '@/apis/admin/analytics/components/platform-summary-cards';

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <PlatformSummaryCards />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <a href="/dashboard/admin/users" className="bg-white p-4 rounded-lg shadow hover:shadow-lg">Users</a>
        <a href="/dashboard/admin/providers" className="bg-white p-4 rounded-lg shadow hover:shadow-lg">Providers</a>
        <a href="/dashboard/admin/bookings" className="bg-white p-4 rounded-lg shadow hover:shadow-lg">Bookings</a>
        <a href="/dashboard/admin/analytics" className="bg-white p-4 rounded-lg shadow hover:shadow-lg">Analytics</a>
      </div>
    </div>
  );
}
