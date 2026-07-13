import { Suspense } from "react";
import { MomoReturnScreen } from "@/components/payment/momo-return-screen";

export default function MomoPaymentReturnPage() {
  return (
    <Suspense fallback={<main className="p-6">Đang tải kết quả thanh toán...</main>}>
      <MomoReturnScreen variant="booking" />
    </Suspense>
  );
}
