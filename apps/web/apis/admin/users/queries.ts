import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { ProviderBalance, ProviderTrustScore } from "@/types/provider";
import {
  adminUserListParamsSchema,
  adminUserListSchema,
  adminUserPayloadSchema,
  adminUserSchema,
  updateAdminUserPayloadSchema,
  updateAdminUserRoleSchema,
} from "./schema";
import type {
  AdminUser,
  AdminUserList,
  AdminUserListParams,
  AdminUserPayload,
  ProviderType,
  ProviderVerificationStatus,
  UpdateAdminUserPayload,
  UpdateAdminUserRolePayload,
} from "./schema";

export type { AdminUser, AdminUserList, AdminUserListParams };

export interface AdminProviderAccount {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  providerType: ProviderType;
  verificationStatus: ProviderVerificationStatus;
  status: "ACTIVE" | "SUSPENDED";
  joinedAt: string;
  servicesCount: number;
  bookingsCount: number;
  rating: number;
  revenueVnd: number;
  balance: ProviderBalance;
  trustScore: ProviderTrustScore;
  violations: Array<{
    id: string;
    type: "REPORT" | "NO_SHOW" | "DISPUTE" | "CONTENT_POLICY";
    note: string;
    createdAt: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
  }>;
  banReason?: string;
  banExpiresAt?: string;
}

const MOCK_ADMIN_PROVIDERS: AdminProviderAccount[] = [
  {
    id: "PRV-2001",
    businessName: "Happy Paws Spa",
    ownerName: "Anh Nguyen",
    email: "owner@happypaws.vn",
    phone: "+84 28 3456 7890",
    providerType: "SPA",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    joinedAt: "2025-12-20",
    servicesCount: 12,
    bookingsCount: 342,
    rating: 4.9,
    revenueVnd: 38400000,
    balance: {
      availableBalance: 7200000,
      reservedBalance: 1260000,
      debtBalance: 0,
      safetyBuffer: 1500000,
      currency: "VND",
      lastUpdatedAt: "2026-06-14 09:30",
    },
    trustScore: {
      score: 92,
      riskLevel: "LOW",
      completionRate: 97,
      noShowRate: 1.2,
      disputeRate: 0.8,
      cashAbnormalityRate: 0.5,
      lastCalculatedAt: "2026-06-14",
    },
    violations: [],
  },
];

function buildUserListParams(params: AdminUserListParams) {
  const parsed = adminUserListParamsSchema.parse(params);
  const queryParams: Record<string, string | number> = {
    page: parsed.page,
    pageSize: parsed.pageSize,
  };

  if (parsed.search?.trim()) {
    queryParams.filters = JSON.stringify({ userName: parsed.search.trim() });
  }

  if (parsed.role) queryParams.role = parsed.role;
  if (parsed.status) queryParams.status = parsed.status;

  return queryParams;
}

export function useAdminUsers(params: AdminUserListParams) {
  const parsedParams = adminUserListParamsSchema.parse(params);

  return useQuery<AdminUserList>({
    queryKey: queryKeys.adminUsers.list(parsedParams),
    queryFn: async () => {
      const response = await api.get<ApiResponse<AdminUserList>>(
        API_ENDPOINTS.USERS.LIST,
        { params: buildUserListParams(parsedParams) },
      );
      return adminUserListSchema.parse(response.data.data);
    },
    keepPreviousData: true,
  });
}

export function useAdminUser(userId: string) {
  return useQuery<AdminUser>({
    queryKey: queryKeys.adminUsers.detail(userId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<AdminUser>>(
        API_ENDPOINTS.USERS.DETAIL(userId),
      );
      return adminUserSchema.parse(response.data.data);
    },
    enabled: Boolean(userId),
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminUserPayload) => {
      const parsedPayload = adminUserPayloadSchema.parse(payload);
      const response = await api.post<ApiResponse<AdminUser>>(
        API_ENDPOINTS.USERS.CREATE,
        parsedPayload,
      );
      return adminUserSchema.parse(response.data.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });
}

export function useUpdateAdminUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateAdminUserPayload) => {
      const parsedPayload = updateAdminUserPayloadSchema.parse(payload);
      const response = await api.put<ApiResponse<AdminUser>>(
        API_ENDPOINTS.USERS.UPDATE(userId),
        parsedPayload,
      );
      return adminUserSchema.parse(response.data.data);
    },
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.adminUsers.detail(user.id), user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });
}

export function useDeactivateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete<ApiResponse<AdminUser>>(
        API_ENDPOINTS.USERS.DELETE(userId),
      );
      return adminUserSchema.parse(response.data.data);
    },
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.adminUsers.detail(user.id), user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });
}

export function useUpdateAdminUserRole(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateAdminUserRolePayload) => {
      const parsedPayload = updateAdminUserRoleSchema.parse(payload);
      const response = await api.patch<ApiResponse<AdminUser>>(
        API_ENDPOINTS.USERS.UPDATE_ROLE(userId),
        parsedPayload,
      );
      return adminUserSchema.parse(response.data.data);
    },
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.adminUsers.detail(user.id), user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });
}

export function useAdminProviders() {
  return useQuery<AdminProviderAccount[]>({
    queryKey: ["admin", "users", "providers"],
    queryFn: async () => MOCK_ADMIN_PROVIDERS,
    initialData: MOCK_ADMIN_PROVIDERS,
    enabled: false,
  });
}
