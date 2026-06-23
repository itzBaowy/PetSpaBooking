import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { PlatformSummaryCards } from "@/apis/admin/analytics/components/platform-summary-cards";
import { BookingAnalyticsChart } from "@/apis/admin/analytics/components/booking-analytics-chart";
import { PlatformRevenueChart } from "@/apis/admin/analytics/components/platform-revenue-chart";
import { TopProvidersTable } from "@/apis/admin/analytics/components/top-providers-table";
import { TopServicesTable } from "@/apis/admin/analytics/components/top-services-table";
import { CommissionRevenueChart } from "@/apis/admin/analytics/components/commission-revenue-chart";
import { ProviderRiskOverviewCard } from "@/apis/admin/analytics/components/provider-risk-overview-card";

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-400 mx-auto space-y-8">
      <PageHeader
        eyebrow="Quản trị / Tổng quan"
        title="Tổng quan hệ thống"
        actions={
          <div className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-gray-300">
            <svg
              className="h-4 w-4 text-gray-400"
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
            <span>30 ngày gần nhất (12/05 - 11/06)</span>
            <svg
              className="ml-1 h-3.5 w-3.5 text-gray-400"
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
        }
      />

      {/* Summary Cards */}
      <PlatformSummaryCards />

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingAnalyticsChart />
        <PlatformRevenueChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.6fr)] gap-6">
        <CommissionRevenueChart />
        <ProviderRiskOverviewCard />
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">
          Lối tắt quản lý
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-4">
          <Link
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
              Quản lý người dùng
            </span>
          </Link>

          <Link
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
              Cửa hàng dịch vụ
            </span>
          </Link>

          <Link
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
              Theo dõi đặt lịch
            </span>
          </Link>

          <Link
            href="/admin/bookings/disputes"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50/70 border border-gray-100 text-center hover:bg-violet-50/50 hover:border-violet-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
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
                  d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Tranh chấp
            </span>
          </Link>

          <Link
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
              Hồ sơ xác thực
            </span>
          </Link>

          <Link
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
              Kiểm duyệt
            </span>
          </Link>

          <Link
            href="/admin/moderation/services"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50/70 border border-gray-100 text-center hover:bg-cyan-50/50 hover:border-cyan-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
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
                  d="M9 12l2 2 4-4M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Duyệt dịch vụ
            </span>
          </Link>

          <Link
            href="/admin/moderation/reports"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50/70 border border-gray-100 text-center hover:bg-red-50/50 hover:border-red-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
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
                  d="M9 12h6m-6 4h6M8 4h8l3 3v13a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h1z"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Báo cáo
            </span>
          </Link>

          <Link
            href="/admin/marketing"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50/70 border border-gray-100 text-center hover:bg-lime-50/50 hover:border-lime-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
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
                  d="M11 5.882V19.24a1.76 1.76 0 01-2.64 1.526l-3.016-1.742A2.5 2.5 0 014 16.86V8.118a2.5 2.5 0 011.344-2.164L8.36 4.212A1.76 1.76 0 0111 5.882zm0 0l7.5-2.5A1.5 1.5 0 0120 4.805v14.39a1.5 1.5 0 01-1.5 1.423L11 18.118"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Chiến dịch
            </span>
          </Link>

          <Link
            href="/admin/audit-logs"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50/70 border border-gray-100 text-center hover:bg-slate-50 hover:border-slate-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
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
                  d="M9 5h6m-8 4h10M7 13h10M7 17h6M5 3h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Nhật ký
            </span>
          </Link>
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
