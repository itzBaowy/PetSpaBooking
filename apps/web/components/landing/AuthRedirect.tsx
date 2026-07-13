"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/apis/auth/queries";
import { useAuthStore } from "@/stores/auth-store";

export function AuthRedirect() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const profileQuery = useProfile();

  useEffect(() => {
    if (!accessToken) return;

    if (profileQuery.error) {
      clearTokens();
      return;
    }

    const role = profileQuery.data?.role;
    if (role === "ADMIN") {
      router.replace("/admin");
    }
    if (role === "PROVIDER") {
      router.replace("/provider");
    }
  }, [accessToken, clearTokens, profileQuery.data?.role, profileQuery.error, router]);

  return null;
}
