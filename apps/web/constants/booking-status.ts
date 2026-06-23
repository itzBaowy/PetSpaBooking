export const BOOKING_STATUS = {
  BOOKED: "BOOKED",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  IN_SERVICE: "IN_SERVICE",
  COMPLETED: "COMPLETED",
  COMMISSION_CHARGED: "COMMISSION_CHARGED",
  CANCELLED_BY_CUSTOMER: "CANCELLED_BY_CUSTOMER",
  CANCELLED_BY_PROVIDER: "CANCELLED_BY_PROVIDER",
  NO_SHOW_REPORTED: "NO_SHOW_REPORTED",
  DISPUTED: "DISPUTED",
  FAILED_APPROVED: "FAILED_APPROVED",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  BOOKED: "Đã đặt",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  IN_SERVICE: "Đang phục vụ",
  COMPLETED: "Hoàn tất",
  COMMISSION_CHARGED: "Đã thu hoa hồng",
  CANCELLED_BY_CUSTOMER: "Khách hủy",
  CANCELLED_BY_PROVIDER: "Nhà cung cấp hủy",
  NO_SHOW_REPORTED: "Đã báo vắng mặt",
  DISPUTED: "Đang tranh chấp",
  FAILED_APPROVED: "Đã duyệt thất bại",
};

export const BOOKING_STATUS_OPTIONS = Object.values(BOOKING_STATUS).map(
  (value) => ({
    label: BOOKING_STATUS_LABELS[value],
    value,
  }),
);
