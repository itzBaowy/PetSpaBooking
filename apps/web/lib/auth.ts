import { useAuthStore } from "@/stores/auth-store";

export function getToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function setToken(token: string): void {
  const currentRefreshToken = useAuthStore.getState().refreshToken ?? "";
  useAuthStore.getState().setTokens({
    accessToken: token,
    refreshToken: currentRefreshToken,
  });
}

export function removeToken(): void {
  useAuthStore.getState().clearTokens();
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
