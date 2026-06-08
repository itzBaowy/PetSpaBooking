export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {/* Provider sub-navigation */}
      <div className="bg-white border-b">
        <nav className="flex space-x-6 px-6 py-4">
          <a href="/dashboard/provider" className="hover:text-blue-500">Dashboard</a>
          <a href="/dashboard/provider/services" className="hover:text-blue-500">Services</a>
          <a href="/dashboard/provider/bookings" className="hover:text-blue-500">Bookings</a>
          <a href="/dashboard/provider/customers" className="hover:text-blue-500">Customers</a>
        </nav>
      </div>
      {children}
    </div>
  );
}
