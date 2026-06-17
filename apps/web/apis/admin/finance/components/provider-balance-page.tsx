"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { BalanceAdjustmentForm } from "./balance-adjustment-form";
import { ProviderLedgerDetail } from "./provider-ledger-detail";
import { useProviderBalanceDetail } from "../queries";

export function ProviderBalancePage({ providerId }: { providerId: string }) {
  const { data: provider } = useProviderBalanceDetail(providerId);

  if (!provider) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          backHref="/admin/finance/ledger"
          backLabel="Quay lại sổ cái"
          eyebrow="Quản trị / Số dư nhà cung cấp"
          title="Không tìm thấy số dư nhà cung cấp"
          description="Hồ sơ số dư mock của nhà cung cấp này chưa có sẵn."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        backHref="/admin/finance/ledger"
        backLabel="Quay lại sổ cái"
        eyebrow="Quản trị / Số dư nhà cung cấp"
        title={provider.providerName}
        description={`${provider.providerId} / Chủ sở hữu: ${provider.ownerName}`}
        actions={
          <Link
            href={`/admin/providers/${provider.providerId}`}
            className="inline-flex h-10 items-center rounded-xl border border-border-subtle bg-surface px-4 text-sm font-bold text-foreground shadow-sm hover:bg-surface-muted"
          >
            Chi tiết nhà cung cấp
          </Link>
        }
      />
      <ProviderLedgerDetail provider={provider} />
      <BalanceAdjustmentForm defaultProviderId={provider.providerId} />
    </div>
  );
}
