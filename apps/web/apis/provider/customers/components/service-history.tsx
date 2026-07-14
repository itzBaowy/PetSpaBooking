"use client";

import Link from "next/link";
import {
  ProviderBadge,
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  providerDate,
  providerMoney,
  sortByDateDesc,
} from "@/apis/provider/_shared/provider-ui";
import { useCustomer } from "../queries";

export function ServiceHistory({ customerId }: { customerId: string }) {
  const query = useCustomer(customerId);

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }

  const bookings = sortByDateDesc(query.data?.bookings ?? [], (booking) => booking.appointmentStart);
  if (bookings.length === 0) return <ProviderEmpty text="Chưa có lịch sử dịch vụ." />;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
      <h3 className="font-extrabold">Lịch sử booking</h3>
      <div className="mt-4 divide-y divide-border-subtle">
        {bookings.map((booking) => (
          <div key={booking.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href={`/provider/bookings/${booking.id}`} className="font-extrabold text-brand hover:underline">
                #{booking.id.slice(-8)}
              </Link>
              <p className="mt-1 text-sm text-muted">
                {booking.service?.name ?? "Dịch vụ"} / {providerDate(booking.appointmentStart)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <ProviderBadge value={booking.status} />
              <strong>{providerMoney.format(booking.totalAmount)}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
