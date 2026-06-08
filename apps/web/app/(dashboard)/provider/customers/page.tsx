import { CustomerTable } from '@/apis/provider/customers/components/customer-table';

export default function Customers() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <CustomerTable />
    </div>
  );
}
