import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "@/types/auth";
import { createCookieStorage } from "./cookie-store";

interface Auth {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setTokens: ({ accessToken }: { accessToken: string }) => void;
  setUser: (user: User | null) => void;
  clearTokens: () => void;
  logout: () => void;
}

export const useAuthStore = create<Auth>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setTokens: ({ accessToken }) => {
        set({ accessToken, isAuthenticated: true });
      },
      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      clearTokens: () => set({ accessToken: null, isAuthenticated: false }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      skipHydration: true,
      storage: createJSONStorage(() => createCookieStorage()),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
