"use client";

import { useRouter } from "next/navigation";
import { ActionMenu } from "@/components/ui/action-menu";
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

export function ProviderDisputesPage() {
  const router = useRouter();
  const query = useProviderBookings({ page: 1, pageSize: 200, status: "DISPUTE" });

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }

  const disputes = query.data?.items ?? [];

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Tranh chấp"
        description="Hiển thị các booking đang ở trạng thái tranh chấp từ API booking provider."
      />

      {disputes.length === 0 ? (
        <ProviderEmpty text="Không có booking nào đang tranh chấp." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface shadow-sm">
          <table className="min-w-[920px] w-full text-left">
            <thead className="bg-surface-muted text-xs font-extrabold uppercase text-subtle">
              <tr>
                {["Booking", "Khách hàng", "Dịch vụ", "Ngày hẹn", "Giá trị", "Trạng thái", "Thao tác"].map((title) => (
                  <th key={title} className="px-4 py-3 last:text-right">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {disputes.map((booking) => (
                <tr key={booking.id} className="hover:bg-surface-muted/50">
                  <td className="px-4 py-4 font-extrabold text-brand">#{booking.id.slice(-8)}</td>
                  <td className="px-4 py-4 text-sm">{booking.customer?.users?.fullName ?? "Khách hàng"}</td>
                  <td className="px-4 py-4 text-sm">{booking.service?.name ?? "Dịch vụ"}</td>
                  <td className="px-4 py-4 text-sm text-muted">{providerDate(booking.appointmentStart)}</td>
                  <td className="px-4 py-4 font-black">{providerMoney.format(booking.totalAmount)}</td>
                  <td className="px-4 py-4"><ProviderBadge value={booking.status} /></td>
                  <td className="px-4 py-4 text-right">
                    <ActionMenu
                      items={[
                        {
                          label: "Xem booking",
                          onClick: () => router.push(`/provider/bookings/${booking.id}`),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
