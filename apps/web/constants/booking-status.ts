export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  CHECKED_OUT: "CHECKED_OUT",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
  DISPUTE: "DISPUTE",
  NONE_ARRIVAL: "NONE_ARRIVAL",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  CHECKED_OUT: "Đã check-out",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  REJECTED: "Nhà cung cấp từ chối",
  DISPUTE: "Đang tranh chấp",
  NONE_ARRIVAL: "Khách không đến",
};

export const BOOKING_STATUS_OPTIONS = Object.values(BOOKING_STATUS).map(
  (value) => ({
    label: BOOKING_STATUS_LABELS[value],
    value,
  }),
);
