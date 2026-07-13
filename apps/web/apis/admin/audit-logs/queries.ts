"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { listSchema, nested, textValue } from "@/apis/admin/supported-api";

export interface AuditLogItem {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  actionType: string;
  target: string;
  targetType: string;
  targetId: string;
  note: string;
  createdAt: string;
  createAt: string;
}

type DefinedQuery<T> = UseQueryResult<T, unknown> & { data: T };

function withDefault<T>(query: UseQueryResult<T, unknown>, fallback: T): DefinedQuery<T> {
  return { ...query, data: query.data ?? fallback } as DefinedQuery<T>;
}

export const auditLogKeys = {
  all: ["admin", "audit-logs"] as const,
  lists: () => [...auditLogKeys.all, "list"] as const,
};

function normalizeAuditLog(log: Record<string, unknown>): AuditLogItem {
  const actionType = textValue(log.actionType ?? log.action, "SYSTEM");
  const createdAt = textValue(log.createdAt ?? log.createAt ?? log.updatedAt, "");

  return {
    id: textValue(log.id, ""),
    actorName: textValue(log.actorName ?? nested(log, "admin", "fullName") ?? nested(log, "actor", "fullName")),
    actorRole: textValue(log.actorRole ?? nested(log, "actor", "role"), "ADMIN"),
    action: actionType,
    actionType,
    target: textValue(log.target ?? log.targetType ?? log.entityType),
    targetType: textValue(log.targetType ?? log.entityType),
    targetId: textValue(log.targetId ?? log.entityId),
    note: textValue(log.note ?? log.adminNote ?? log.description),
    createdAt,
    createAt: createdAt,
  };
}

export function useAuditLogs() {
  const query = useQuery<AuditLogItem[]>({
    queryKey: auditLogKeys.lists(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.AUDIT_LOGS);
      return listSchema.parse(response.data.data).items
        .map((item) => normalizeAuditLog(item as Record<string, unknown>));
    },
  });
  return withDefault(query, []);
}
