import { BookingAnalyticsChart } from "@/apis/admin/analytics/components/booking-analytics-chart";
import { PlatformRevenueChart } from "@/apis/admin/analytics/components/platform-revenue-chart";

export default function Analytics() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Platform Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingAnalyticsChart />
        <PlatformRevenueChart />
      </div>
    </div>
  );
}
