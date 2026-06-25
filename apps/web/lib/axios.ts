import axios from "axios";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse } from "@/types/api";
import type { AuthToken } from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<AuthToken> | null = null;

function refreshTokens() {
  if (!refreshPromise) {
    const { accessToken, refreshToken, setTokens } = useAuthStore.getState();

    if (!accessToken || !refreshToken) {
      return Promise.reject(new Error("Missing auth tokens"));
    }

    refreshPromise = api
      .post<ApiResponse<AuthToken>>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      .then((response) => {
        const nextTokens = response.data.data;
        setTokens(nextTokens);
        return nextTokens;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes(
      API_ENDPOINTS.AUTH.REFRESH,
    );

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;

      try {
        const tokens = await refreshTokens();
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearTokens();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().clearTokens();
    }

    return Promise.reject(error);
  },
);
