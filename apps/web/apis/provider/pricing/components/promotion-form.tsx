"use client";

import { ProviderEmpty, ProviderPageHeader } from "@/apis/provider/_shared/provider-ui";

export function PromotionForm() {
  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Khuyen mai"
        description="Backend hien chua co endpoint provider promotions, nen man nay chua gui request that."
      />
      <ProviderEmpty text="Chua co API de tao hoac quan ly khuyen mai. Se fetch sau khi BE bo sung endpoint." />
    </div>
  );
}
