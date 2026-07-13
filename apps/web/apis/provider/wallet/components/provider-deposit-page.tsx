"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerMoney,
  providerStatusText,
} from "@/apis/provider/_shared/provider-ui";
import {
  useProviderWallet,
  useSyncProviderDepositPayment,
} from "../queries";
import { ProviderDepositDialog } from "./provider-deposit-dialog";

export function ProviderDepositPage() {
  const [open, setOpen] = useState(false);
  const wallet = useProviderWallet();
  const sync = useSyncProviderDepositPayment();

  if (wallet.isLoading) return <ProviderLoading />;
  if (wallet.isError) {
    return <ProviderError error={wallet.error} retry={() => void wallet.refetch()} />;
  }

  const data = wallet.data!;

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Nạp ký quỹ provider"
        description="Tạo thanh toán MoMo sandbox thật qua API và đồng bộ lại số dư ký quỹ sau khi thanh toán."
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setOpen(true)}>Tạo thanh toán MoMo</Button>
            <Button
              disabled={sync.isLoading || wallet.isFetching}
              variant="outline"
              onClick={() =>
                sync.mutate(undefined, {
                  onSettled: () => {
                    void wallet.refetch();
                  },
                })
              }
            >
              {sync.isLoading || wallet.isFetching ? "Đang đồng bộ..." : "Đồng bộ MoMo"}
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <p className="text-sm text-muted">Số dư ký quỹ hiện tại</p>
          <p className="mt-2 text-3xl font-black">
            {providerMoney.format(data.depositBalance)}
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <p className="text-sm text-muted">Trạng thái ký quỹ</p>
          <p className="mt-2 text-3xl font-black">
            {providerStatusText(data.depositStatus)}
          </p>
        </div>
      </section>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5 text-sm leading-6 text-muted">
        Sau khi tạo thanh toán, PetLink mở trang MoMo sandbox từ `payUrl`.
        Nếu bạn đã thanh toán nhưng chưa được redirect về ví, dùng nút đồng bộ MoMo để backend kiểm tra giao dịch pending mới nhất.
      </div>

      <Link
        className="inline-flex h-11 items-center rounded-xl border border-border-muted px-5 text-sm font-bold text-foreground hover:bg-surface-muted"
        href="/provider/wallet"
      >
        Về ví provider
      </Link>

      {open ? (
        <ProviderDepositDialog
          depositBalance={data.depositBalance}
          depositStatus={data.depositStatus}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
