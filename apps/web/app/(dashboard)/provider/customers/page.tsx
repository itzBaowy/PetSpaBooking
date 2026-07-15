import { CustomerTable } from "@/apis/provider/customers/components/customer-table";
import { ProviderPageHeader } from "@/apis/provider/_shared/provider-ui";

export default function Customers() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <ProviderPageHeader
          title="Khách hàng"
          description="Theo dõi khách hàng, thú cưng và lịch sử sử dụng dịch vụ tại cơ sở của bạn."
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <CustomerTable />
        </div>
      </div>
    </main>
  );
}
