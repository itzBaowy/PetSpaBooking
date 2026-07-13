"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ProviderBadge,
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerDate,
  providerMoney,
  providerStatusText,
} from "@/apis/provider/_shared/provider-ui";
import {
  useProviderWallet,
  useProviderWalletTransactions,
  useProviderWithdrawals,
} from "../queries";
import { ProviderDepositDialog } from "./provider-deposit-dialog";
import { ProviderWithdrawalDialog } from "./provider-withdrawal-dialog";

export function ProviderWalletPage() {
  const searchParams = useSearchParams();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(
    () => searchParams.get("deposit") === "1",
  );
  const query = useProviderWallet();

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return (
      <ProviderError
        error={query.error}
        retry={() => void query.refetch()}
      />
    );
  }

  const wallet = query.data!;

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Ví provider"
        description="Số dư ví và ký quỹ được đọc từ Wallet API."
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setDepositOpen(true)}>Nạp ký quỹ</Button>
            <Button variant="outline" onClick={() => setWithdrawOpen(true)}>
              Tạo yêu cầu rút tiền
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Số dư ví"
          value={providerMoney.format(wallet.walletBalance)}
        />
        <Metric
          label="Số dư ký quỹ"
          value={providerMoney.format(wallet.depositBalance)}
        />
        <Metric label="Trạng thái ký quỹ" value={providerStatusText(wallet.depositStatus)} />
      </div>

      <div className="flex flex-wrap gap-3">
        <LinkButton href="/provider/wallet/transactions" text="Xem giao dịch" />
        <LinkButton
          href="/provider/wallet/withdrawals"
          text="Xem yêu cầu rút tiền"
        />
        <Button variant="outline" onClick={() => void query.refetch()}>
          Tải lại số dư
        </Button>
      </div>

      {depositOpen ? (
        <ProviderDepositDialog
          depositBalance={wallet.depositBalance}
          depositStatus={wallet.depositStatus}
          onClose={() => setDepositOpen(false)}
        />
      ) : null}

      {withdrawOpen ? (
        <ProviderWithdrawalDialog
          walletBalance={wallet.walletBalance}
          onClose={() => setWithdrawOpen(false)}
        />
      ) : null}
    </div>
  );
}

export function ProviderTransactionsPage() {
  const [page, setPage] = useState(1);
  const query = useProviderWalletTransactions({ page, pageSize: 20 });

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return (
      <ProviderError
        error={query.error}
        retry={() => void query.refetch()}
      />
    );
  }

  const result = query.data!;

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Lịch sử giao dịch"
        description="Sổ giao dịch đọc từ Wallet API."
      />
      {result.items.length === 0 ? (
        <ProviderEmpty text="Chưa có giao dịch." />
      ) : (
        <div className="grid gap-3">
          {result.items.map((item) => (
            <article
              className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm"
              key={item.id}
            >
              <div className="flex justify-between gap-4">
                <div>
                  <ProviderBadge value={item.type} />
                  <p className="mt-2 text-sm text-muted">
                    {item.note ?? item.referenceId ?? item.id}
                  </p>
                  <p className="text-xs text-muted">
                    {providerDate(item.createAt)}
                  </p>
                </div>
                <strong
                  className={
                    item.amount >= 0 ? "text-emerald-700" : "text-red-700"
                  }
                >
                  {providerMoney.format(item.amount)}
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}
      <Pager
        page={page}
        total={result.pagination.totalPages}
        setPage={setPage}
      />
    </div>
  );
}

export function ProviderWithdrawalsPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const wallet = useProviderWallet();
  const query = useProviderWithdrawals({ page, pageSize: 20 });

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return (
      <ProviderError
        error={query.error}
        retry={() => void query.refetch()}
      />
    );
  }

  const result = query.data!;

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Yêu cầu rút tiền"
        description="Trạng thái yêu cầu rút tiền được lấy từ API."
        action={
          <Button onClick={() => setCreateOpen(true)}>Tạo yêu cầu</Button>
        }
      />
      {result.items.length === 0 ? (
        <ProviderEmpty text="Chưa có yêu cầu rút tiền." />
      ) : (
        <div className="grid gap-3">
          {result.items.map((item) => (
            <article
              className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm"
              key={item.id}
            >
              <div className="flex justify-between gap-4">
                <div>
                  <ProviderBadge value={item.status} />
                  <p className="mt-2 text-sm font-bold">
                    {item.bankCode} · {item.bankAccountNumber}
                  </p>
                  <p className="text-xs text-muted">
                    {providerDate(item.requestedAt)}
                  </p>
                  {item.reason ? (
                    <p className="mt-1 text-xs text-muted">{item.reason}</p>
                  ) : null}
                </div>
                <strong>{providerMoney.format(item.amount)}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
      <Pager
        page={page}
        total={result.pagination.totalPages}
        setPage={setPage}
      />
      {createOpen ? (
        <ProviderWithdrawalDialog
          walletBalance={wallet.data?.walletBalance}
          onClose={() => setCreateOpen(false)}
        />
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function LinkButton({ href, text }: { href: string; text: string }) {
  return (
    <Link
      className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover"
      href={href}
    >
      {text}
    </Link>
  );
}

function Pager({
  page,
  total,
  setPage,
}: {
  page: number;
  total: number;
  setPage: (page: number) => void;
}) {
  if (total <= 1) return null;

  return (
    <div className="flex justify-center gap-3">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        Trước
      </Button>
      <span className="py-2 text-sm font-semibold">
        {page}/{total}
      </span>
      <Button
        variant="outline"
        disabled={page >= total}
        onClick={() => setPage(page + 1)}
      >
        Sau
      </Button>
    </div>
  );
}
