"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/feedback-provider";
import {
  ProviderBadge,
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerDate,
  providerErrorText,
  providerMoney,
} from "@/apis/provider/_shared/provider-ui";
import type { ProviderBookingApi } from "@/types/provider-api";
import { useProviderBookingAction, useProviderBookings } from "../queries";
import { ProviderQrDialog } from "./provider-booking-dialogs";

const statuses = ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "COMPLETED", "CANCELLED", "REJECTED", "NO_ARRIVAL"];

export function ProviderBookingsPage() {
  const [status, setStatus] = useState("");
  const [qrDialog, setQrDialog] = useState<{
    booking: ProviderBookingApi;
    action: "check-in" | "check-out";
  } | null>(null);
  const query = useProviderBookings({ page: 1, pageSize: 50, status: status || undefined });
  const action = useProviderBookingAction();
  const { showToast } = useToast();

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }

  const mutateAction = (booking: ProviderBookingApi, type: "confirm" | "reject" | "cancel" | "no-arrival") => {
    const needsReason = type === "reject" || type === "cancel";
    const reason = needsReason ? window.prompt("Nhập lý do:")?.trim() : undefined;
    if (needsReason && !reason) return;
    action.mutate(
      { id: booking.id, action: type, reason },
      {
        onSuccess: () => showToast("Đã cập nhật lịch đặt.", "success"),
        onError: (error) => showToast(providerErrorText(error), "error"),
      },
    );
  };

  const items = query.data?.items ?? [];

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Đặt lịch"
        description="Danh sách và thao tác vòng đời lịch đặt dùng API provider."
      />

      <select
        className="h-11 rounded-xl border border-border-muted bg-surface px-4 text-sm font-semibold"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <option value="">Tất cả trạng thái</option>
        {statuses.map((value) => (
          <option key={value} value={value}>
            {value.replaceAll("_", " ")}
          </option>
        ))}
      </select>

      {items.length === 0 ? (
        <ProviderEmpty text="Không có lịch đặt phù hợp." />
      ) : (
        <div className="grid gap-3">
          {items.map((booking) => (
            <article className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm" key={booking.id}>
              <div className="flex flex-col justify-between gap-4 lg:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link className="font-extrabold text-brand hover:underline" href={`/provider/bookings/${booking.id}`}>
                      #{booking.id.slice(-8)}
                    </Link>
                    <ProviderBadge value={booking.status} />
                    <ProviderBadge value={booking.paymentStatus} />
                  </div>
                  <p className="mt-2 text-sm font-semibold">
                    {booking.customer?.users?.fullName ?? "Khách hàng"} · {booking.pet?.name ?? "Thú cưng"}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {booking.service?.name ?? "Dịch vụ"} · {providerDate(booking.appointmentStart)}
                  </p>
                  <p className="mt-2 font-extrabold">{providerMoney.format(booking.totalAmount)}</p>
                </div>
                <div className="flex flex-wrap items-start justify-end gap-2">
                  {booking.status === "PENDING" ? (
                    <>
                      <Button disabled={action.isLoading} onClick={() => mutateAction(booking, "confirm")}>
                        Xác nhận
                      </Button>
                      <Button variant="outline" disabled={action.isLoading} onClick={() => mutateAction(booking, "reject")}>
                        Từ chối
                      </Button>
                    </>
                  ) : null}
                  {booking.status === "CONFIRMED" ? (
                    <>
                      <Button disabled={action.isLoading} onClick={() => setQrDialog({ booking, action: "check-in" })}>
                        Quét QR check-in
                      </Button>
                      <Button variant="outline" disabled={action.isLoading} onClick={() => mutateAction(booking, "no-arrival")}>
                        Không đến
                      </Button>
                      <Button variant="outline" disabled={action.isLoading} onClick={() => mutateAction(booking, "cancel")}>
                        Hủy
                      </Button>
                    </>
                  ) : null}
                  {booking.status === "CHECKED_IN" ? (
                    <Button disabled={action.isLoading} onClick={() => setQrDialog({ booking, action: "check-out" })}>
                      Quét QR check-out
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {qrDialog ? (
        <ProviderQrDialog
          booking={qrDialog.booking}
          title={qrDialog.action === "check-in" ? "Quét QR check-in" : "Quét QR check-out"}
          submitLabel={qrDialog.action === "check-in" ? "Xác nhận check-in" : "Xác nhận check-out"}
          pending={action.isLoading}
          onClose={() => setQrDialog(null)}
          onSubmit={(qrToken) =>
            action.mutate(
              { id: qrDialog.booking.id, action: qrDialog.action, qrToken },
              {
                onSuccess: () => {
                  showToast(qrDialog.action === "check-in" ? "Đã check-in." : "Đã check-out.", "success");
                  setQrDialog(null);
                },
                onError: (error) => showToast(providerErrorText(error), "error"),
              },
            )
          }
        />
      ) : null}
    </div>
  );
}
