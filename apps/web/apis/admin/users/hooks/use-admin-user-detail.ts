"use client";

import { useState } from "react";
import {
  useAdminUser,
  useDeactivateAdminUser,
  useUpdateAdminUserRole,
} from "../queries";
import type { AdminUserRole } from "../schema";
import {
  getDeactivateConfirmMessage,
  getRoleChangeConfirmMessage,
} from "../user-helpers";

export function useAdminUserDetail(userId: string) {
  const userQuery = useAdminUser(userId);
  const deactivateMutation = useDeactivateAdminUser();
  const roleMutation = useUpdateAdminUserRole(userId);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const user = userQuery.data;

  async function deactivateUser() {
    if (!user) return;
    const confirmed = window.confirm(getDeactivateConfirmMessage(user));
    if (!confirmed) return;

    await deactivateMutation.mutateAsync(user.id);
  }

  async function changeRole(role: AdminUserRole) {
    if (!user || user.role === role) return;
    const confirmed = window.confirm(getRoleChangeConfirmMessage(user, role));
    if (!confirmed) return;

    await roleMutation.mutateAsync({ role });
  }

  return {
    userQuery,
    user,
    isEditOpen,
    setIsEditOpen,
    deactivateUser,
    changeRole,
  };
}
