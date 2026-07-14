"use client";

import { useRouter } from "next/navigation";
import { ActionMenu } from "@/components/ui/action-menu";
import {
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  providerDate,
  sortByDateDesc,
} from "@/apis/provider/_shared/provider-ui";
import { useCustomers } from "../queries";

export function CustomerTable() {
  const router = useRouter();
  const query = useCustomers();

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }

  const customers = sortByDateDesc(query.data ?? [], (customer) => customer.lastBookingAt);
  if (customers.length === 0) {
    return <ProviderEmpty text="Chưa có khách hàng nào từng booking dịch vụ của bạn." />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface shadow-sm">
      <table className="min-w-[860px] w-full text-left">
        <thead className="bg-surface-muted text-xs font-extrabold uppercase text-subtle">
          <tr>
            <th className="px-4 py-3">Khách hàng</th>
            <th className="px-4 py-3">Liên hệ</th>
            <th className="px-4 py-3">Thú cưng</th>
            <th className="px-4 py-3">Số booking</th>
            <th className="px-4 py-3">Booking gần nhất</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-surface-muted/50">
              <td className="px-4 py-4">
                <strong className="block">{customer.name}</strong>
                <span className="mt-1 block break-all text-xs text-muted">{customer.id}</span>
              </td>
              <td className="px-4 py-4 text-sm">
                <p>{customer.email ?? "Chưa có email"}</p>
                <p className="mt-1 text-muted">{customer.phone ?? "Chưa có SĐT"}</p>
              </td>
              <td className="px-4 py-4 text-sm">
                {customer.pets.length
                  ? customer.pets.map((pet) => pet.name).filter(Boolean).join(", ")
                  : "Chưa có dữ liệu"}
              </td>
              <td className="px-4 py-4 font-extrabold">{customer.totalBookings}</td>
              <td className="px-4 py-4 text-sm text-muted">{providerDate(customer.lastBookingAt)}</td>
              <td className="px-4 py-4 text-right">
                <ActionMenu
                  items={[
                    {
                      label: "Xem chi tiết",
                      onClick: () => router.push(`/provider/customers/${encodeURIComponent(customer.id)}`),
                    },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
