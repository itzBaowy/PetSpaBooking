"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/apis/auth/queries";
import {
  useMyProviderDocuments,
  useMyProviderInfo,
} from "@/apis/provider/verification/queries";
import { useAuthStore } from "@/stores/auth-store";
import { ProviderAlreadyPrivilegedState } from "./provider-registration/already-privileged-state";
import { ProviderApplicationWizard } from "./provider-registration/provider-application-wizard";
import { ProviderRegistrationLoadingState } from "./provider-registration/loading-state";
import { PendingProviderState } from "./provider-registration/pending-provider-state";

export function ProviderVerificationForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearTokens = useAuthStore((state) => state.clearTokens);

  const handleLogout = () => {
    clearTokens();
    queryClient.clear();
    router.replace("/login");
  };

  const profileQuery = useProfile();
  const role = profileQuery.data?.role;
  const providerStatus = profileQuery.data?.providerStatus;

  // Chỉ query provider info nếu tài khoản đang đăng nhập là PROVIDER
  const isProvider = Boolean(accessToken && role === "PROVIDER");
  const providerQuery = useMyProviderInfo(isProvider);
  const documentQuery = useMyProviderDocuments(Boolean(providerQuery.data));

  if (accessToken && profileQuery.isLoading) {
    return (
      <ProviderRegistrationLoadingState text="Đang kiểm tra tài khoản..." />
    );
  }

  // Admin hoặc Provider đã VERIFIED thì báo đã có quyền
  if (
    accessToken &&
    (role === "ADMIN" ||
      (role === "PROVIDER" && providerStatus === "VERIFIED"))
  ) {
    return (
      <ProviderAlreadyPrivilegedState
        roleLabel={role === "ADMIN" ? "quản trị viên" : "nhà cung cấp"}
      />
    );
  }

  // Nếu là tài khoản PROVIDER và đang tải hồ sơ
  if (isProvider && providerQuery.isLoading) {
    return (
      <ProviderRegistrationLoadingState text="Đang kiểm tra hồ sơ nhà cung cấp..." />
    );
  }

  // Nếu là tài khoản PROVIDER và đã có dữ liệu hồ sơ (PENDING/REJECTED/SUSPENDED)
  if (isProvider && providerQuery.data) {
    return (
      <PendingProviderState
        provider={providerQuery.data}
        documents={documentQuery.data ?? []}
        isLoadingDocuments={documentQuery.isLoading}
        onLogout={handleLogout}
      />
    );
  }
  return <ProviderApplicationWizard />;
}
