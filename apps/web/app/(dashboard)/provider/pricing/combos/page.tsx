import { ComboForm } from "@/apis/provider/pricing/components/combo-form";

export default function Combos() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gói dịch vụ</h1>
      <div className="max-w-2xl">
        <ComboForm />
      </div>
    </div>
  );
}
