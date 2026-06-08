import { CustomerDetail } from '@/apis/provider/customers/components/customer-detail';
import { PetList } from '@/apis/provider/customers/components/pet-list';

export default function CustomerDetailPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Details</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CustomerDetail />
        </div>
        <div className="lg:col-span-2">
          <PetList />
        </div>
      </div>
    </div>
  );
}
