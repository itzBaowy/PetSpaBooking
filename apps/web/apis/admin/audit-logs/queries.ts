"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface AuditLogItem {
  id: string;
  actorName: string;
  actorRole: "ADMIN" | "PET_OWNER" | "SERVICE_PROVIDER";
  actionType:
    | "CONTENT_APPROVED"
    | "CONTENT_HIDDEN"
    | "REPORT_RESOLVED"
    | "DISPUTE_REFUNDED"
    | "BOOKING_STATUS_UPDATED"
    | "ACCOUNT_LOCKED";
  target: string;
  note: string;
  createdAt: string;
}

export const auditLogMockItems: AuditLogItem[] = [
  {
    id: "AUD-90012",
    actorName: "Quản trị viên cấp cao",
    actorRole: "ADMIN",
    actionType: "DISPUTE_REFUNDED",
    target: "DSP-5014 / BK-92018",
    note: "Đã duyệt hoàn tiền một phần sau khi xem xét bằng chứng tranh chấp dịch vụ grooming.",
    createdAt: "2026-06-14 20:34",
  },
  {
    id: "AUD-90008",
    actorName: "Quản trị viên cấp cao",
    actorRole: "ADMIN",
    actionType: "CONTENT_HIDDEN",
    target: "MOD-1038 / VetCare 24h",
    note: "Đã ẩn bảng giá trong thời gian chờ nhà cung cấp chỉnh sửa.",
    createdAt: "2026-06-14 18:12",
  },
  {
    id: "AUD-89991",
    actorName: "Quản trị viên vận hành",
    actorRole: "ADMIN",
    actionType: "REPORT_RESOLVED",
    target: "RPT-7764 / Dịch vụ tắm cơ bản",
    note: "Đã xử lý báo cáo sau khi xác nhận ảnh cập nhật và ghi chú phụ phí.",
    createdAt: "2026-06-13 16:44",
  },
  {
    id: "AUD-89960",
    actorName: "Quản trị viên cấp cao",
    actorRole: "ADMIN",
    actionType: "BOOKING_STATUS_UPDATED",
    target: "BK-91970",
    note: "Đã điều chỉnh trạng thái đặt lịch thành Khách hủy bởi quản trị viên.",
    createdAt: "2026-06-13 10:05",
  },
];

export const auditLogKeys = {
  all: ["admin", "audit-logs"] as const,
  lists: () => [...auditLogKeys.all, "list"] as const,
};

export function useAuditLogs() {
  return useQuery<AuditLogItem[]>({
    queryKey: auditLogKeys.lists(),
    queryFn: async () => {
      const response = await api.get<AuditLogItem[]>("/admin/audit-logs");
      return response.data;
    },
    initialData: auditLogMockItems,
    enabled: false,
  });
}
