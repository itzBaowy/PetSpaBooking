import { textValue } from "@/apis/admin/supported-api";

export const NOTIFICATION_TYPE_OPTIONS = [
  { value: "ADMIN_ANNOUNCEMENT", label: "Thông báo quản trị" },
  { value: "SYSTEM_MAINTENANCE", label: "Bảo trì hệ thống" },
  { value: "POLICY_UPDATE", label: "Cập nhật chính sách" },
  { value: "BOOKING_ONLINE_PAID", label: "Lịch đặt đã thanh toán online" },
  { value: "DISPUTE_RESOLVED", label: "Tranh chấp đã giải quyết" },
];

const notificationTypeLabels: Record<string, string> = {
  ADMIN_ANNOUNCEMENT: "Thông báo quản trị",
  SYSTEM_MAINTENANCE: "Bảo trì hệ thống",
  POLICY_UPDATE: "Cập nhật chính sách",
  DISPUTE_CREATED: "Khách hàng tạo tranh chấp",
  DISPUTE_RESOLVED: "Tranh chấp đã giải quyết",
  BOOKING_COMPLETED: "Lịch đặt hoàn tất",
  BOOKING_ONLINE_PAID: "Lịch đặt đã thanh toán online",
  BOOKING_CREATED: "Lịch đặt mới",
  BOOKING_CANCELLED: "Lịch đặt đã hủy",
  BOOKING_CONFIRMED: "Lịch đặt đã xác nhận",
  PAYMENT_SUCCESS: "Thanh toán thành công",
  PAYMENT_FAILED: "Thanh toán thất bại",
  WITHDRAWAL_APPROVED: "Yêu cầu rút tiền đã duyệt",
  WITHDRAWAL_REJECTED: "Yêu cầu rút tiền bị từ chối",
  SERVICE_APPROVED: "Dịch vụ đã duyệt",
  SERVICE_REJECTED: "Dịch vụ bị từ chối",
  CHAT_MESSAGE_NEW: "Tin nhắn mới",
  BOOKING_REJECTED: "Lịch đặt bị từ chối",
  BOOKING_NO_ARRIVAL: "Khách không đến",
  BOOKING_CHECKED_IN: "Đã check-in",
  BOOKING_CHECKED_OUT: "Đã check-out",
  REFUND_PENDING: "Đang chờ hoàn tiền",
  REFUND_COMPLETED: "Đã hoàn tiền",
  REFUND_REJECTED: "Yêu cầu hoàn tiền bị từ chối",
  WITHDRAWAL_PAID: "Yêu cầu rút tiền đã thanh toán",
  PROVIDER_VERIFIED: "Nhà cung cấp đã được xác minh",
  PROVIDER_REJECTED: "Nhà cung cấp bị từ chối",
  PROVIDER_DOCUMENT_APPROVED: "Hồ sơ đã được duyệt",
  PROVIDER_DOCUMENT_REJECTED: "Hồ sơ bị từ chối",
  PROVIDER_READY_FOR_VERIFICATION: "Hồ sơ đã sẵn sàng xác minh",
  PROVIDER_DEPOSIT_TOP_UP: "Nạp ký quỹ thành công",
  SERVICE_HIDDEN_BY_ADMIN: "Dịch vụ đã bị quản trị viên ẩn",
  SERVICE_UNHIDDEN_BY_ADMIN: "Dịch vụ đã được hiển thị lại",
  ACCOUNT_STATUS_CHANGED: "Trạng thái tài khoản đã thay đổi",
};

const customTitleTypes = new Set([
  "ADMIN_ANNOUNCEMENT",
  "SYSTEM_MAINTENANCE",
  "POLICY_UPDATE",
]);

const screenLabels: Record<string, string> = {
  dashboard: "Tổng quan",
  notifications: "Thông báo",
  bookings: "Lịch đặt",
  booking_detail: "Chi tiết lịch đặt",
  disputes: "Tranh chấp",
  dispute_detail: "Chi tiết tranh chấp",
  services: "Dịch vụ",
  service_detail: "Chi tiết dịch vụ",
  wallet: "Ví",
  withdrawals: "Rút tiền",
  profile: "Hồ sơ",
};

function titleCaseSnake(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatNotificationType(value: unknown) {
  const raw = textValue(value, "");
  if (!raw) return "Thông báo";
  return notificationTypeLabels[raw] ?? titleCaseSnake(raw);
}

export function formatNotificationTitle(type: unknown, title: unknown) {
  const rawType = textValue(type, "");
  const rawTitle = textValue(title, "");

  if (rawType && !customTitleTypes.has(rawType) && notificationTypeLabels[rawType]) {
    return notificationTypeLabels[rawType];
  }

  return rawTitle || formatNotificationType(rawType);
}

export function formatScreen(value: unknown) {
  const raw = textValue(value, "");
  if (!raw) return "Không có màn hình liên quan";
  return screenLabels[raw] ?? titleCaseSnake(raw);
}
