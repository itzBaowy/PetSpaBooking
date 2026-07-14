"use client";

import { ProviderEmpty, ProviderPageHeader } from "@/apis/provider/_shared/provider-ui";

export function ComboForm() {
  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Combo dich vu"
        description="Backend hien chua co endpoint provider combos, nen man nay chua gui request that."
      />
      <ProviderEmpty text="Chua co API de tao hoac quan ly combo dich vu. Se fetch sau khi BE bo sung endpoint." />
    </div>
  );
}
