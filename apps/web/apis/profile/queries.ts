import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse } from "@/types/api";
import { profileSchema } from "./schema";
import type { Profile } from "./schema";

export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
};

export function useProfile() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery<Profile>({
    queryKey: profileKeys.me(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Profile>>(
        API_ENDPOINTS.AUTH.PROFILE,
      );
      return profileSchema.parse(response.data.data);
    },
    enabled: Boolean(accessToken),
  });
}

export function useUploadProfileAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await api.post<ApiResponse<Profile>>(
        API_ENDPOINTS.USERS.AVATAR,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return profileSchema.parse(response.data.data);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.me(), profile);
      queryClient.setQueryData(queryKeys.auth.me(), profile);
      void queryClient.invalidateQueries({ queryKey: profileKeys.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
      confirmPassword?: string;
    }) => {
      const response = await api.patch<ApiResponse<unknown>>(
        API_ENDPOINTS.USERS.CHANGE_PASSWORD,
        payload,
      );
      return response.data.data;
    },
  });
}
