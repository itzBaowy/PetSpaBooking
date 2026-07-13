"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/feedback-provider";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

type SettingValue = {
  value: number;
};

type AdminSettings = {
  platformCommissionRate?: SettingValue;
};

const DEFAULT_COMMISSION_RATE = 0.15;

export function CommissionConfigPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const settings = useQuery({
    queryKey: ["admin", "settings", "commission-rate"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<AdminSettings>>(
        API_ENDPOINTS.ADMIN.SETTINGS,
      );
      return {
        platformCommissionRate:
          response.data.data.platformCommissionRate?.value ??
          DEFAULT_COMMISSION_RATE,
      };
    },
  });

  const mutation = useMutation({
    mutationFn: async (platformCommissionRate: number) =>
      (
        await api.patch<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.SETTINGS, {
          platformCommissionRate,
        })
      ).data.data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "settings", "commission-rate"],
      });
      showToast("Đã lưu cấu hình hoa hồng.", "success");
    },
    onError: () => showToast("Không thể lưu cấu hình hoa hồng.", "error"),
  });

  const value = settings.data?.platformCommissionRate ?? DEFAULT_COMMISSION_RATE;
  const percentValue = Number((value * 100).toFixed(2));

  function updatePercent(rawValue: string) {
    mutation.reset();
    queryClient.setQueryData(["admin", "settings", "commission-rate"], {
      platformCommissionRate: Number(rawValue) / 100,
    });
  }

  function save() {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      showToast("Tỷ lệ hoa hồng phải nằm trong khoảng 0 đến 100%.", "error");
      return;
    }

    mutation.mutate(value);
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        backHref="/admin/finance/commission"
        backLabel="Quay lại hoa hồng"
        eyebrow="Quản trị / Tài chính / Hoa hồng"
        title="Cấu hình hoa hồng"
        description="Đọc và lưu tỷ lệ hoa hồng mặc định qua Admin system settings API."
      />

      {settings.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
          Không thể tải cấu hình hoa hồng.
        </div>
      ) : null}

      <div className="max-w-xl rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <label className="space-y-2 text-sm font-semibold">
          <span>Hoa hồng mặc định (%)</span>
          <Input
            min={0}
            max={100}
            step={1}
            type="number"
            value={percentValue}
            onChange={(event) => updatePercent(event.target.value)}
          />
        </label>
        <p className="mt-2 text-xs font-medium text-muted">
          Ví dụ nhập 15 nghĩa là 15%. Backend lưu giá trị này dưới dạng 0.15.
        </p>

        <div className="mt-6 flex justify-end">
          <Button disabled={settings.isLoading || mutation.isLoading} onClick={save}>
            {mutation.isLoading ? "Đang lưu..." : "Lưu cấu hình"}
          </Button>
        </div>
      </div>
    </div>
  );
}
