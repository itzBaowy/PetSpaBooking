import { PromotionForm } from '@/apis/provider/pricing/components/promotion-form';

export default function Promotions() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Promotions</h1>
      <div className="max-w-2xl">
        <PromotionForm />
      </div>
    </div>
  );
}
