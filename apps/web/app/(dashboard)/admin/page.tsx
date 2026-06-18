import { PlatformSummaryCards } from "@/apis/admin/analytics/components/platform-summary-cards";
import { BookingAnalyticsChart } from "@/apis/admin/analytics/components/booking-analytics-chart";
import { PlatformRevenueChart } from "@/apis/admin/analytics/components/platform-revenue-chart";
import { TopProvidersTable } from "@/apis/admin/analytics/components/top-providers-table";
import { TopServicesTable } from "@/apis/admin/analytics/components/top-services-table";

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
            Admin / Overview
          </nav>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
        </div>

        {/* Date Filter Dropdown Mock */}
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm text-sm text-gray-600 font-medium hover:border-gray-300 cursor-pointer transition-colors">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Last 30 Days (May 12 - Jun 11)</span>
          <svg
            className="w-3.5 h-3.5 text-gray-400 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Summary Cards */}
      <PlatformSummaryCards />

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingAnalyticsChart />
        <PlatformRevenueChart />
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">
          Quick Management Links
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <a
            href="/admin/users"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50/70 border border-gray-100 text-center hover:bg-blue-50/50 hover:border-blue-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Manage Users
            </span>
          </a>

          <a
            href="/admin/providers"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50/70 border border-gray-100 text-center hover:bg-purple-50/50 hover:border-purple-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Service Shops
            </span>
          </a>

          <a
            href="/admin/bookings"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50/70 border border-gray-100 text-center hover:bg-green-50/50 hover:border-green-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Track Bookings
            </span>
          </a>

          <a
            href="/admin/verification"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50/70 border border-gray-100 text-center hover:bg-amber-50/50 hover:border-amber-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Verifications
            </span>
          </a>

          <a
            href="/admin/moderation"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50/70 border border-gray-100 text-center hover:bg-rose-50/50 hover:border-rose-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Moderations
            </span>
          </a>

          <a
            href="/admin/analytics"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50/70 border border-gray-100 text-center hover:bg-emerald-50/50 hover:border-emerald-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Full Analytics
            </span>
          </a>
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProvidersTable />
        <TopServicesTable />
      </div>
    </div>
  );
}
