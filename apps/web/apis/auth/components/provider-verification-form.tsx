"use client";

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
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const profileQuery = useProfile();
  const role = profileQuery.data?.role;
  const providerQuery = useMyProviderInfo(
    Boolean(accessToken && role === "PENDING_PROVIDER"),
  );
  const documentQuery = useMyProviderDocuments(Boolean(providerQuery.data));

  if (accessToken && profileQuery.isLoading) {
    return (
      <ProviderRegistrationLoadingState text="Đang kiểm tra tài khoản..." />
    );
  }

  if (role === "ADMIN" || role === "PROVIDER") {
    return (
      <ProviderAlreadyPrivilegedState
        roleLabel={role === "ADMIN" ? "quản trị viên" : "nhà cung cấp"}
      />
    );
  }

  if (role === "PENDING_PROVIDER") {
    if (providerQuery.isLoading) {
      return (
        <ProviderRegistrationLoadingState text="Đang tải hồ sơ chờ duyệt..." />
      );
    }

    return (
      <PendingProviderState
        provider={providerQuery.data}
        documents={documentQuery.data ?? []}
        isLoadingDocuments={documentQuery.isLoading}
        onLogout={clearTokens}
      />
    );
  }

  return <ProviderApplicationWizard />;
}
