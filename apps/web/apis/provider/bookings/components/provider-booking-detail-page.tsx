"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/feedback-provider";
import {
  ProviderBadge,
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerDate,
  providerErrorText,
  providerMoney,
} from "@/apis/provider/_shared/provider-ui";
import type { ProviderBookingApi } from "@/types/provider-api";
import { useProviderBookingAction, useProviderBookingDetail } from "../queries";
import { ProviderQrDialog } from "./provider-booking-dialogs";

export function ProviderBookingDetailPage({ bookingId }: { bookingId: string }) {
  const query = useProviderBookingDetail(bookingId);
  const action = useProviderBookingAction();
  const { showToast } = useToast();
  const [qrAction, setQrAction] = useState<"check-in" | "check-out" | null>(null);

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError || !query.data) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }

  const booking = query.data;
  const mutateAction = (type: "confirm" | "reject" | "cancel" | "no-arrival") => {
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

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title={`Lịch đặt #${booking.id.slice(-8)}`}
        description={providerDate(booking.appointmentStart)}
        action={<BookingActions booking={booking} pending={action.isLoading} onAction={mutateAction} onQr={setQrAction} />}
      />
      <Link href="/provider/bookings" className="inline-flex text-sm font-bold text-brand hover:underline">
        Quay lại danh sách
      </Link>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,.6fr)]">
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <ProviderBadge value={booking.status} />
            <ProviderBadge value={booking.paymentStatus} />
            <ProviderBadge value={booking.paymentMethod} />
          </div>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            <Detail label="Khách hàng" value={booking.customer?.users?.fullName ?? "Chưa có dữ liệu"} />
            <Detail label="Email" value={booking.customer?.users?.email ?? "Chưa có dữ liệu"} />
            <Detail label="Số điện thoại" value={booking.customer?.users?.phone ?? "Chưa có dữ liệu"} />
            <Detail label="Thú cưng" value={booking.pet?.name ?? "Chưa có dữ liệu"} />
            <Detail label="Loài / giống" value={`${booking.pet?.species ?? "-"} / ${booking.pet?.breed ?? "-"}`} />
            <Detail label="Dịch vụ" value={booking.service?.name ?? "Chưa có dữ liệu"} />
            <Detail label="Bắt đầu" value={providerDate(booking.appointmentStart)} />
            <Detail label="Kết thúc" value={providerDate(booking.appointmentEnd)} />
          </dl>
        </section>

        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-extrabold">Thanh toán</h2>
          <dl className="mt-5 space-y-3">
            <Price label="Tổng tiền" value={booking.totalAmount} />
            <Detail label="Phương thức" value={booking.paymentMethod?.replaceAll("_", " ")} />
            <Detail label="Trạng thái" value={booking.paymentStatus?.replaceAll("_", " ")} />
            {booking.rejectReason ? <Detail label="Lý do từ chối" value={booking.rejectReason} /> : null}
            {booking.cancelReason ? <Detail label="Lý do hủy" value={booking.cancelReason} /> : null}
          </dl>
        </section>
      </div>

      {qrAction ? (
        <ProviderQrDialog
          booking={booking}
          title={qrAction === "check-in" ? "Quét QR check-in" : "Quét QR check-out"}
          submitLabel={qrAction === "check-in" ? "Xác nhận check-in" : "Xác nhận check-out"}
          pending={action.isLoading}
          onClose={() => setQrAction(null)}
          onSubmit={(qrToken) =>
            action.mutate(
              { id: booking.id, action: qrAction, qrToken },
              {
                onSuccess: () => {
                  showToast(qrAction === "check-in" ? "Đã check-in." : "Đã check-out.", "success");
                  setQrAction(null);
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

function BookingActions({
  booking,
  pending,
  onAction,
  onQr,
}: {
  booking: ProviderBookingApi;
  pending: boolean;
  onAction: (type: "confirm" | "reject" | "cancel" | "no-arrival") => void;
  onQr: (type: "check-in" | "check-out") => void;
}) {
  if (booking.status === "PENDING") {
    return (
      <>
        <Button disabled={pending} onClick={() => onAction("confirm")}>
          Xác nhận
        </Button>
        <Button variant="outline" disabled={pending} onClick={() => onAction("reject")}>
          Từ chối
        </Button>
      </>
    );
  }
  if (booking.status === "CONFIRMED") {
    return (
      <>
        <Button disabled={pending} onClick={() => onQr("check-in")}>
          Quét QR check-in
        </Button>
        <Button variant="outline" disabled={pending} onClick={() => onAction("no-arrival")}>
          Không đến
        </Button>
        <Button variant="outline" disabled={pending} onClick={() => onAction("cancel")}>
          Hủy
        </Button>
      </>
    );
  }
  if (booking.status === "CHECKED_IN") {
    return (
      <Button disabled={pending} onClick={() => onQr("check-out")}>
        Quét QR check-out
      </Button>
    );
  }
  return null;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-extrabold uppercase text-subtle">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value || "-"}</dd>
    </div>
  );
}

function Price({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm font-semibold text-muted">{label}</dt>
      <dd className="text-lg font-black">{providerMoney.format(value)}</dd>
    </div>
  );
}
