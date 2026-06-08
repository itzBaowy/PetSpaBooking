export default function ProviderDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Provider Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">Bookings</div>
        <div className="bg-white p-4 rounded-lg shadow">Revenue</div>
        <div className="bg-white p-4 rounded-lg shadow">Services</div>
        <div className="bg-white p-4 rounded-lg shadow">Customers</div>
      </div>
    </div>
  );
}
