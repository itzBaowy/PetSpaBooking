"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { useToast } from "@/components/ui/feedback-provider";
import {
  ProviderBadge,
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  ProviderPagination,
  ProviderPageHeader,
  providerDate,
  providerErrorText,
  providerMoney,
  providerStatusText,
  sortByDateDesc,
} from "@/apis/provider/_shared/provider-ui";
import type { ProviderBookingApi } from "@/types/provider-api";
import { useProviderBookingAction, useProviderBookings } from "../queries";
import { ProviderBookingReasonDialog, ProviderQrDialog } from "./provider-booking-dialogs";

const statuses = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "DISPUTE",
  "NO_ARRIVAL",
];

export function ProviderBookingsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [qrDialog, setQrDialog] = useState<{
    booking: ProviderBookingApi;
    action: "check-in" | "check-out";
  } | null>(null);
  const [reasonDialog, setReasonDialog] = useState<{
    booking: ProviderBookingApi;
    action: "reject" | "cancel";
  } | null>(null);
  const query = useProviderBookings({ page, pageSize, status: status || undefined });
  const action = useProviderBookingAction();
  const { showToast } = useToast();

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }

  const mutateAction = (booking: ProviderBookingApi, type: "confirm" | "reject" | "cancel" | "no-arrival", actionReason?: string) => {
    if ((type === "reject" || type === "cancel") && !actionReason) return;
    action.mutate(
      { id: booking.id, action: type, reason: actionReason },
      {
        onSuccess: () => showToast("Đã cập nhật lịch đặt.", "success"),
        onError: (error) => showToast(providerErrorText(error), "error"),
      },
    );
  };

  const items = sortByDateDesc(query.data?.items ?? [], (booking) => booking.appointmentStart);

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Đặt lịch"
        description="Danh sách và thao tác vòng đời lịch đặt dùng API provider."
      />

      <CustomSelect
        className="w-full sm:w-64"
        value={status}
        options={[
          { label: "Tất cả trạng thái", value: "" },
          ...statuses.map((value) => ({
            label: providerStatusText(value),
            value,
          })),
        ]}
        onValueChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
      />

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
                    <ProviderBadge value={`Booking: ${formatStatus(booking.status)}`} />
                    <ProviderBadge value={`Thanh toán: ${formatStatus(booking.paymentStatus)}`} />
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
                      <Button variant="outline" disabled={action.isLoading} onClick={() => setReasonDialog({ booking, action: "reject" })}>
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
                      <Button variant="outline" disabled={action.isLoading} onClick={() => setReasonDialog({ booking, action: "cancel" })}>
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

      {query.data?.pagination ? (
        <ProviderPagination
          page={query.data.pagination.page}
          pageSize={query.data.pagination.pageSize}
          totalItems={query.data.pagination.totalItems}
          totalPages={query.data.pagination.totalPages}
          onPageChange={setPage}
        />
      ) : null}

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

      {reasonDialog ? (
        <ProviderBookingReasonDialog
          title={reasonDialog.action === "reject" ? "Từ chối lịch đặt" : "Hủy lịch đặt"}
          description={
            reasonDialog.action === "reject"
              ? "Lịch đang chờ xác nhận. Nhập lý do từ chối để khách hàng nhận được thông tin rõ ràng."
              : "Lịch đã được xác nhận. Nhập lý do hủy để hệ thống ghi nhận và xử lý thanh toán nếu cần."
          }
          submitLabel={reasonDialog.action === "reject" ? "Từ chối" : "Hủy lịch"}
          pending={action.isLoading}
          onClose={() => setReasonDialog(null)}
          onSubmit={(reason) => {
            mutateAction(reasonDialog.booking, reasonDialog.action, reason);
            setReasonDialog(null);
          }}
        />
      ) : null}
    </div>
  );
}

function formatStatus(value?: string | null) {
  return providerStatusText(value);
}
