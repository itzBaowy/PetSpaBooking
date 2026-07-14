import { PriceListTable } from "@/apis/provider/pricing/components/price-list-table";

export default function Pricing() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý bảng giá</h1>
      <PriceListTable />
    </div>
  );
}
