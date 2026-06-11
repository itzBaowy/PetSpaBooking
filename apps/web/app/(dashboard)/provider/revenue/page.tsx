import { RevenueSummaryCards } from "@/apis/provider/revenue/components/revenue-summary-cards";
import { RevenueChart } from "@/apis/provider/revenue/components/revenue-chart";

export default function Revenue() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Revenue Analytics</h1>
      <RevenueSummaryCards />
      <div className="mt-6">
        <RevenueChart />
      </div>
    </div>
  );
}
