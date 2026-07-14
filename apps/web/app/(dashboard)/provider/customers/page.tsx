import { CustomerTable } from "@/apis/provider/customers/components/customer-table";

export default function Customers() {
  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-bold">Khách hàng đã booking</h1>
      <p className="mb-6 text-sm text-muted">
        Danh sách được tổng hợp từ các lịch đặt thuộc provider hiện tại.
      </p>
      <CustomerTable />
    </div>
  );
}
