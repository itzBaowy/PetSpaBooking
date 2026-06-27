"use client";

import axios from "axios";
import { FormEvent, useState } from "react";
import { useCreateAdminUser, useUpdateAdminUser } from "../queries";
import type { AdminUser, AdminUserPayload } from "../schema";

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Thao tác thất bại.";
  }

  return "Thao tác thất bại.";
}

function buildInitialForm(user?: AdminUser): AdminUserPayload {
  return {
    userName: user?.userName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    fullName: user?.fullName ?? "",
    avatar: user?.avatar ?? "",
    role: user?.role ?? "CUSTOMER",
    status: user?.status ?? "ACTIVE",
  };
}

export function useAdminUserForm({
  user,
  onSuccess,
}: {
  user?: AdminUser;
  onSuccess: () => void;
}) {
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser(user?.id ?? "");
  const [form, setForm] = useState<AdminUserPayload>(() =>
    buildInitialForm(user),
  );
  const [error, setError] = useState("");
  const isEdit = Boolean(user);
  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  function updateField(name: keyof AdminUserPayload, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const payload: AdminUserPayload = {
        ...form,
        fullName: form.fullName?.trim() || undefined,
        avatar: form.avatar?.trim() || undefined,
      };

      if (isEdit) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }

      onSuccess();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  return {
    form,
    error,
    isEdit,
    isSubmitting,
    updateField,
    submit,
  };
}
