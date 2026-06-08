export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {/* Admin sub-navigation */}
      <div className="bg-white border-b">
        <nav className="flex space-x-6 px-6 py-4">
          <a href="/dashboard/admin" className="hover:text-blue-500">Dashboard</a>
          <a href="/dashboard/admin/users" className="hover:text-blue-500">Users</a>
          <a href="/dashboard/admin/providers" className="hover:text-blue-500">Providers</a>
          <a href="/dashboard/admin/verification" className="hover:text-blue-500">Verification</a>
          <a href="/dashboard/admin/moderation" className="hover:text-blue-500">Moderation</a>
        </nav>
      </div>
      {children}
    </div>
  );
}
