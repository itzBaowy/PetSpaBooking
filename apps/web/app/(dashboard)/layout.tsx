export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder */}
      <aside className="w-64 bg-gray-800 text-white">
        <nav className="p-4">
          <ul className="space-y-2">
            <li>Navigation Items</li>
          </ul>
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
