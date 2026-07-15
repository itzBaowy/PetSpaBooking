import Link from "next/link";
import { CustomerDetail } from "@/apis/provider/customers/components/customer-detail";
import { PetList } from "@/apis/provider/customers/components/pet-list";
import { ServiceHistory } from "@/apis/provider/customers/components/service-history";
import { ProviderPageHeader } from "@/apis/provider/_shared/provider-ui";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
      <ProviderPageHeader
        title="Chi tiết khách hàng"
        description="Thông tin khách hàng, thú cưng và lịch sử dịch vụ tại cơ sở."
        action={
          <Link href="/provider/customers" className="inline-flex h-10 items-center rounded-xl border border-emerald-200 bg-white px-4 text-sm font-bold text-emerald-700 shadow-sm hover:bg-emerald-50">
            ← Quay lại danh sách
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CustomerDetail customerId={decodeURIComponent(customerId)} />
        </div>
        <div className="lg:col-span-2">
          <PetList customerId={decodeURIComponent(customerId)} />
        </div>
      </div>
      <ServiceHistory customerId={decodeURIComponent(customerId)} />
      </div>
    </main>
  );
}
