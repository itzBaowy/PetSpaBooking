import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse } from "@/types/api";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  User,
} from "@/types/auth";

export const authKeys = {
  all: ["auth"] as const,
  login: () => [...authKeys.all, "login"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      const response = await api.post<ApiResponse<LoginResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials,
      );
      return response.data.data;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await api.post<ApiResponse<RegisterResponse>>(
        API_ENDPOINTS.AUTH.REGISTER,
        payload,
      );
      return response.data.data;
    },
  });
}

export function useProfile() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery<User>({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<User>>(
        API_ENDPOINTS.AUTH.PROFILE,
      );
      return response.data.data;
    },
    enabled: Boolean(accessToken),
  });
}
