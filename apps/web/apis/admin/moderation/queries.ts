import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
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

export const moderationKeys = {
  all: ["admin", "moderation"] as const,
  contents: () => [...moderationKeys.all, "contents"] as const,
  reports: () => [...moderationKeys.all, "reports"] as const,
};

type DefinedQuery<T> = UseQueryResult<T, unknown> & { data: T };

function withDefault<T>(query: UseQueryResult<T, unknown>, fallback: T): DefinedQuery<T> {
  return { ...query, data: query.data ?? fallback } as DefinedQuery<T>;
}

function unsupported(): never {
  throw new Error("Backend has no moderation API yet.");
}

export function useModerationQueue() {
  const query = useQuery<ModerationItem[]>({
    queryKey: moderationKeys.contents(),
    queryFn: async (): Promise<ModerationItem[]> => unsupported(),
    retry: false,
  });
  return withDefault(query, []);
}

export function useReports() {
  const query = useQuery<UserReport[]>({
    queryKey: moderationKeys.reports(),
    queryFn: async (): Promise<UserReport[]> => unsupported(),
    retry: false,
  });
  return withDefault(query, []);
}

export function useResolveReport() {
  return useMutation({
    mutationFn: async (payload: ReportResolutionData) => {
      void payload;
      return unsupported();
    },
  });
}

export function useResolveModerationContent() {
  return useMutation({
    mutationFn: async (payload: ContentModerationActionData) => {
      void payload;
      return unsupported();
    },
  });
}
