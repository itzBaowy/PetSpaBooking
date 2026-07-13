"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, PageHeader } from "@/components/ui";
import { useToast } from "@/components/ui/feedback-provider";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

type AdminSettings = {
  minProviderDeposit?: SettingValue;
  platformCommissionRate?: SettingValue;
  bookingNoArrivalGraceMinutes?: SettingValue;
};

type SettingValue = {
  value: number;
};

type DepositConfigForm = {
  minProviderDeposit: number;
  platformCommissionRate: number;
  bookingNoArrivalGraceMinutes: number;
};

const DEFAULT_VALUES: DepositConfigForm = {
  minProviderDeposit: 300000,
  platformCommissionRate: 0.15,
  bookingNoArrivalGraceMinutes: 15,
};

export function DepositConfigPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const settings = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<AdminSettings>>(API_ENDPOINTS.ADMIN.SETTINGS);
      const data = response.data.data;
      return {
        minProviderDeposit:
          data.minProviderDeposit?.value ?? DEFAULT_VALUES.minProviderDeposit,
        platformCommissionRate:
          data.platformCommissionRate?.value ?? DEFAULT_VALUES.platformCommissionRate,
        bookingNoArrivalGraceMinutes:
          data.bookingNoArrivalGraceMinutes?.value ??
          DEFAULT_VALUES.bookingNoArrivalGraceMinutes,
      };
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: DepositConfigForm) =>
      (
        await api.patch<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.SETTINGS, payload)
      ).data.data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      showToast("Đã lưu cấu hình hệ thống.", "success");
    },
    onError: () => showToast("Không thể lưu cấu hình hệ thống.", "error"),
  });

  const values = settings.data ?? DEFAULT_VALUES;
  const update = (key: keyof DepositConfigForm, value: string) => {
    mutation.reset();
    queryClient.setQueryData(["admin", "settings"], {
      ...values,
      [key]: Number(value),
    });
  };
  const updateCommissionPercent = (value: string) => {
    mutation.reset();
    queryClient.setQueryData(["admin", "settings"], {
      ...values,
      platformCommissionRate: Number(value) / 100,
    });
  };

  function save() {
    if (
      !Number.isFinite(values.minProviderDeposit) ||
      values.minProviderDeposit < 0 ||
      !Number.isFinite(values.platformCommissionRate) ||
      values.platformCommissionRate < 0 ||
      values.platformCommissionRate > 1 ||
      !Number.isFinite(values.bookingNoArrivalGraceMinutes) ||
      values.bookingNoArrivalGraceMinutes < 0
    ) {
      showToast("Cấu hình không hợp lệ.", "error");
      return;
    }

    mutation.mutate(values);
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        backHref="/admin/finance/ledger"
        backLabel="Quay lại tài chính"
        eyebrow="Quản trị / Tài chính"
        title="Cấu hình ký quỹ"
        description="Đọc và lưu cấu hình nghiệp vụ từ Admin system settings API."
      />

      {settings.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
          Không thể tải cấu hình hệ thống.
        </div>
      ) : null}

      <div className="max-w-3xl rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <ConfigField
            label="Ký quỹ tối thiểu (VND)"
            value={values.minProviderDeposit}
            onChange={(value) => update("minProviderDeposit", value)}
          />
          <ConfigField
            label="Hoa hồng mặc định (%)"
            max={100}
            step="1"
            value={Number((values.platformCommissionRate * 100).toFixed(2))}
            onChange={updateCommissionPercent}
          />
          <ConfigField
            label="Thời gian tối thiểu khách hàng không đến (phút)"
            value={values.bookingNoArrivalGraceMinutes}
            onChange={(value) => update("bookingNoArrivalGraceMinutes", value)}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <Button disabled={settings.isLoading || mutation.isLoading} onClick={save}>
            {mutation.isLoading ? "Đang lưu..." : "Lưu cấu hình"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConfigField({
  label,
  value,
  step,
  max,
  onChange,
}: {
  label: string;
  value: number;
  step?: string;
  max?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <Input
        min={0}
        max={max}
        step={step}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
