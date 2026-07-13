import { Suspense } from "react";
import { MomoReturnScreen } from "@/components/payment/momo-return-screen";

export default function ProviderDepositReturnPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<p>Đang tải kết quả nạp ký quỹ...</p>}>
        <MomoReturnScreen variant="provider-deposit" />
      </Suspense>
    </div>
  );
}
