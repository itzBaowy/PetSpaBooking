"use client";

import {
  ProviderBadge,
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerDate,
  providerMoney,
} from "@/apis/provider/_shared/provider-ui";
import { useProviderBookings } from "@/apis/provider/bookings/queries";

export function ProviderRevenuePage() {
  const query = useProviderBookings({ page: 1, pageSize: 200 });

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }

  const bookings = query.data?.items ?? [];
  const completed = bookings.filter((booking) => booking.status === "COMPLETED");
  const gross = sum(completed.map((booking) => booking.totalAmount));
  const online = sum(completed.filter((booking) => booking.paymentMethod === "ONLINE").map((booking) => booking.totalAmount));
  const cash = gross - online;
  const pending = sum(
    bookings
      .filter((booking) => ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT"].includes(booking.status))
      .map((booking) => booking.totalAmount),
  );

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Doanh thu"
        description="Tổng hợp từ booking thật của provider. Khi BE có API revenue riêng, màn này có thể đổi sang endpoint chuyên dụng."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Doanh thu hoàn tất" value={providerMoney.format(gross)} />
        <Metric title="Online" value={providerMoney.format(online)} />
        <Metric title="Tiền mặt" value={providerMoney.format(cash)} />
        <Metric title="Đang chờ hoàn tất" value={providerMoney.format(pending)} />
      </section>

      {completed.length === 0 ? (
        <ProviderEmpty text="Chưa có booking hoàn tất để ghi nhận doanh thu." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface shadow-sm">
          <table className="min-w-[920px] w-full text-left">
            <thead className="bg-surface-muted text-xs font-extrabold uppercase text-subtle">
              <tr>
                {["Booking", "Khách hàng", "Dịch vụ", "Ngày", "Thanh toán", "Doanh thu"].map((title) => (
                  <th key={title} className="px-4 py-3">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {completed.map((booking) => (
                <tr key={booking.id} className="hover:bg-surface-muted/50">
                  <td className="px-4 py-4 font-extrabold text-brand">#{booking.id.slice(-8)}</td>
                  <td className="px-4 py-4 text-sm">{booking.customer?.users?.fullName ?? "Khách hàng"}</td>
                  <td className="px-4 py-4 text-sm">{booking.service?.name ?? "Dịch vụ"}</td>
                  <td className="px-4 py-4 text-sm text-muted">{providerDate(booking.appointmentStart)}</td>
                  <td className="px-4 py-4">
                    <ProviderBadge value={booking.paymentMethod} />
                  </td>
                  <td className="px-4 py-4 font-black">{providerMoney.format(booking.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <p className="text-xs font-extrabold uppercase text-subtle">{title}</p>
      <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
    </article>
  );
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
