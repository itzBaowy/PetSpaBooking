"use client";

import {
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  providerDate,
} from "@/apis/provider/_shared/provider-ui";
import { useCustomer } from "../queries";

export function CustomerDetail({ customerId }: { customerId: string }) {
  const query = useCustomer(customerId);

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }
  if (!query.data) return <ProviderEmpty text="Không tìm thấy khách hàng." />;

  const customer = query.data;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
      <h3 className="font-extrabold">Thông tin khách hàng</h3>
      <div className="mt-4 space-y-3 text-sm">
        <Info label="Tên" value={customer.name} />
        <Info label="Email" value={customer.email ?? "Chưa có email"} />
        <Info label="SĐT" value={customer.phone ?? "Chưa có SĐT"} />
        <Info label="Tổng booking" value={String(customer.totalBookings)} />
        <Info label="Booking gần nhất" value={providerDate(customer.lastBookingAt)} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase text-subtle">{label}</p>
      <p className="mt-1 break-words font-semibold">{value}</p>
    </div>
  );
}
