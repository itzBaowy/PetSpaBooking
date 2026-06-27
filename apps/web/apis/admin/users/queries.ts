import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
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
  UpdateAdminUserPayload,
  UpdateAdminUserRolePayload,
} from "./schema";

export type { AdminUser, AdminUserList, AdminUserListParams };


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
