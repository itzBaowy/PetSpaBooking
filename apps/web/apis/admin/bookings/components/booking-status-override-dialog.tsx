"use client";

import { useState } from "react";
import { CustomSelect } from "@/components/ui/custom-select";
import { BOOKING_STATUS_OPTIONS } from "@/constants/booking-status";
import { bookingStatusOverrideSchema } from "../schema";
import { useOverrideBookingStatus } from "../queries";
import type { AdminBooking } from "../queries";

export function BookingStatusOverrideDialog({
  booking,
  onClose,
}: {
  booking: AdminBooking;
  onClose: () => void;
}) {
  const overrideMutation = useOverrideBookingStatus();
  const [status, setStatus] = useState(booking.status);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const result = bookingStatusOverrideSchema.safeParse({
      bookingId: booking.id,
      status,
      reason,
      adminId: "ADM-001",
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Ghi đè trạng thái không hợp lệ.");
      return;
    }

    overrideMutation.mutate(result.data, {
      onError: () => {
        window.alert("Ghi đè trạng thái đã hợp lệ. Backend chưa được kết nối.");
        onClose();
      },
      onSuccess: () => {
        window.alert("Đã lưu ghi đè trạng thái đặt lịch (mock).");
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-subtle bg-surface p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Ghi đè trạng thái đặt lịch
            </h2>
            <p className="mt-1 text-sm text-muted">
              {booking.id} / {booking.service}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-bold text-muted hover:bg-surface-muted"
          >
            Đóng
          </button>
        </div>
        <div className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-muted">Trạng thái</span>
            <CustomSelect
              defaultValue={status}
              options={BOOKING_STATUS_OPTIONS}
              onValueChange={(value) =>
                setStatus(value as AdminBooking["status"])
              }
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-muted">Lý do</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="min-h-28 w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm outline-none focus:ring-4 focus:ring-brand-soft"
              placeholder="Nhập bằng chứng đã rà soát và lý do kiểm toán..."
            />
          </label>
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-danger">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-border-subtle px-4 text-sm font-bold text-foreground hover:bg-surface-muted"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 rounded-xl bg-foreground px-4 text-sm font-bold text-background hover:bg-muted"
          >
            Lưu ghi đè
          </button>
        </div>
      </div>
    </div>
  );
}
