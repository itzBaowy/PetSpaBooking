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
    actorName: "Super Admin",
    actorRole: "ADMIN",
    actionType: "DISPUTE_REFUNDED",
    target: "DSP-5014 / BK-92018",
    note: "Approved partial refund after reviewing grooming dispute evidence.",
    createdAt: "2026-06-14 20:34",
  },
  {
    id: "AUD-90008",
    actorName: "Super Admin",
    actorRole: "ADMIN",
    actionType: "CONTENT_HIDDEN",
    target: "MOD-1038 / VetCare 24h",
    note: "Price table hidden pending provider correction request.",
    createdAt: "2026-06-14 18:12",
  },
  {
    id: "AUD-89991",
    actorName: "Operations Admin",
    actorRole: "ADMIN",
    actionType: "REPORT_RESOLVED",
    target: "RPT-7764 / Basic Bath Service",
    note: "Report resolved after confirming updated photos and surcharge note.",
    createdAt: "2026-06-13 16:44",
  },
  {
    id: "AUD-89960",
    actorName: "Super Admin",
    actorRole: "ADMIN",
    actionType: "BOOKING_STATUS_UPDATED",
    target: "BK-91970",
    note: "Booking status adjusted to CANCELLED with cancelledBy ADMIN.",
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
