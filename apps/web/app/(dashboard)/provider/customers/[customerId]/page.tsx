import Link from "next/link";
import { CustomerDetail } from "@/apis/provider/customers/components/customer-detail";
import { PetList } from "@/apis/provider/customers/components/pet-list";
import { ServiceHistory } from "@/apis/provider/customers/components/service-history";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;

  return (
    <div className="space-y-6 p-6">
      <Link href="/provider/customers" className="text-sm font-bold text-brand hover:underline">
        Quay lại danh sách khách hàng
      </Link>
      <h1 className="text-2xl font-bold">Chi tiết khách hàng</h1>
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
  );
}
