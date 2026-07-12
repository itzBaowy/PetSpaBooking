import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { clearAuthCookies, createCookieStorage } from "./cookie-store";

interface Auth {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: ({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) => void;
  clearTokens: () => void;
}

export const useAuthStore = create<Auth>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }),
      clearTokens: () => {
        set({ accessToken: null, refreshToken: null });
        clearAuthCookies();
      },
    }),
    {
      name: "auth-storage",
      skipHydration: true,
      storage: createJSONStorage(() => createCookieStorage()),
    },
  ),
);
