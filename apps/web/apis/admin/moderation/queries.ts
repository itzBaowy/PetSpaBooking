import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type {
  ContentModerationActionData,
  ReportResolutionData,
} from "./schema";

export type ModerationStatus =
  | "PENDING"
  | "APPROVED"
  | "HIDDEN"
  | "NEEDS_REVISION";
export type ModerationContentType = "SERVICE" | "IMAGE" | "PRICE_TABLE";
export type ReportStatus = "OPEN" | "INVESTIGATING" | "RESOLVED";

export interface ModerationItem {
  id: string;
  providerName: string;
  serviceName: string;
  type: ModerationContentType;
  submittedAt: string;
  status: ModerationStatus;
  risk: "LOW" | "MEDIUM" | "HIGH";
}

export interface UserReport {
  id: string;
  target: string;
  targetType: "PROVIDER" | "SERVICE";
  reporterRole: "CUSTOMER" | "PROVIDER";
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export const moderationMockItems: ModerationItem[] = [
  {
    id: "MOD-1042",
    providerName: "Happy Paws Spa",
    serviceName: "Premium Grooming Package",
    type: "SERVICE",
    submittedAt: "2026-06-14 09:20",
    status: "PENDING",
    risk: "MEDIUM",
  },
  {
    id: "MOD-1038",
    providerName: "VetCare 24h",
    serviceName: "Vaccination Price Table",
    type: "PRICE_TABLE",
    submittedAt: "2026-06-13 16:45",
    status: "NEEDS_REVISION",
    risk: "HIGH",
  },
  {
    id: "MOD-1031",
    providerName: "Pet Hotel Luna",
    serviceName: "Suite Room Gallery",
    type: "IMAGE",
    submittedAt: "2026-06-12 11:10",
    status: "APPROVED",
    risk: "LOW",
  },
];

export const reportMockItems: UserReport[] = [
  {
    id: "RPT-7781",
    target: "Happy Paws Spa",
    targetType: "PROVIDER",
    reporterRole: "CUSTOMER",
    reason: "Service quality did not match listed package details.",
    status: "OPEN",
    createdAt: "2026-06-14 10:05",
  },
  {
    id: "RPT-7764",
    target: "Basic Bath Service",
    targetType: "SERVICE",
    reporterRole: "CUSTOMER",
    reason: "Reported inaccurate photos and unclear price surcharge.",
    status: "INVESTIGATING",
    createdAt: "2026-06-13 14:22",
  },
  {
    id: "RPT-7702",
    target: "VetCare 24h",
    targetType: "PROVIDER",
    reporterRole: "PROVIDER",
    reason: "Duplicate service listing appears under another provider.",
    status: "RESOLVED",
    createdAt: "2026-06-11 08:15",
  },
];

export const moderationKeys = {
  all: ["admin", "moderation"] as const,
  contents: () => [...moderationKeys.all, "contents"] as const,
  reports: () => [...moderationKeys.all, "reports"] as const,
};

export function useModerationQueue() {
  return useQuery<ModerationItem[]>({
    queryKey: moderationKeys.contents(),
    queryFn: async () => {
      const response = await api.get<ModerationItem[]>(
        "/admin/moderation/contents",
      );
      return response.data;
    },
    initialData: moderationMockItems,
    enabled: false,
  });
}

export function useReports() {
  return useQuery<UserReport[]>({
    queryKey: moderationKeys.reports(),
    queryFn: async () => {
      const response = await api.get<UserReport[]>("/admin/moderation/reports");
      return response.data;
    },
    initialData: reportMockItems,
    enabled: false,
  });
}

export function useResolveReport() {
  return useMutation({
    mutationFn: async (payload: ReportResolutionData) => {
      const response = await api.post(
        "/admin/moderation/reports/resolve",
        payload,
      );
      return response.data as { success: boolean };
    },
  });
}

export function useResolveModerationContent() {
  return useMutation({
    mutationFn: async (payload: ContentModerationActionData) => {
      const response = await api.post(
        "/admin/moderation/contents/resolve",
        payload,
      );
      return response.data as { success: boolean };
    },
  });
}
