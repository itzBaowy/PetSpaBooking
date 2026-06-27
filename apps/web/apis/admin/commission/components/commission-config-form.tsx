"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/feedback-provider";
import { CustomSelect } from "@/components/ui/custom-select";
import { commissionConfigSchema } from "../schema";
import { useSaveCommissionConfig } from "../queries";

export function CommissionConfigForm() {
  const { showToast } = useToast();
  const saveMutation = useSaveCommissionConfig();
  const [name, setName] = useState("Hoa hồng mặc định cho dịch vụ grooming");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [scope, setScope] = useState<
    "GLOBAL" | "SERVICE_CATEGORY" | "PROVIDER_TYPE"
  >("SERVICE_CATEGORY");
  const [scopeValue, setScopeValue] = useState("GROOMING");
  const [value, setValue] = useState("15");
  const [effectiveFrom, setEffectiveFrom] = useState("2026-06-20");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const result = commissionConfigSchema.safeParse({
      name,
      type,
      scope,
      scopeValue,
      value: Number(value),
      effectiveFrom,
      appliesToNewBookingsOnly: true,
      isActive,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Cấu hình hoa hồng không hợp lệ.");
      return;
    }

    setError("");
    saveMutation.mutate(result.data, {
      onError: () =>
        showToast("Không thể lưu cấu hình. Backend chưa hỗ trợ API này.", "error"),
      onSuccess: () => showToast("Đã lưu cấu hình hoa hồng.", "success"),
    });
  };

  return (
    <section className="rounded-xl border border-border-subtle bg-surface p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Cấu hình hoa hồng mới
        </h2>
        <p className="mt-1 text-sm text-muted">
          Cấu hình này không thay đổi đặt lịch cũ hoặc bản ghi hoa hồng đã có.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-semibold text-muted">Tên cấu hình</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-xl border border-border-subtle bg-surface px-4 text-sm font-semibold text-foreground shadow-sm outline-none focus:ring-4 focus:ring-brand-soft"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-muted">Loại</span>
          <CustomSelect
            defaultValue={type}
            options={[
              { label: "Theo phần trăm", value: "PERCENTAGE" },
              { label: "Phí cố định", value: "FIXED" },
            ]}
            onValueChange={(nextType) =>
              setType(nextType as "PERCENTAGE" | "FIXED")
            }
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-muted">Phạm vi</span>
          <CustomSelect
            defaultValue={scope}
            options={[
              { label: "Toàn sàn", value: "GLOBAL" },
              { label: "Danh mục dịch vụ", value: "SERVICE_CATEGORY" },
              { label: "Loại nhà cung cấp", value: "PROVIDER_TYPE" },
            ]}
            onValueChange={(nextScope) =>
              setScope(
                nextScope as "GLOBAL" | "SERVICE_CATEGORY" | "PROVIDER_TYPE",
              )
            }
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-muted">Giá trị phạm vi</span>
          <input
            value={scopeValue}
            onChange={(event) => setScopeValue(event.target.value)}
            className="h-11 w-full rounded-xl border border-border-subtle bg-surface px-4 text-sm font-semibold text-foreground shadow-sm outline-none focus:ring-4 focus:ring-brand-soft"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-muted">Giá trị</span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            inputMode="numeric"
            className="h-11 w-full rounded-xl border border-border-subtle bg-surface px-4 text-sm font-semibold text-foreground shadow-sm outline-none focus:ring-4 focus:ring-brand-soft"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-muted">Hiệu lực từ</span>
          <input
            value={effectiveFrom}
            onChange={(event) => setEffectiveFrom(event.target.value)}
            type="date"
            className="h-11 w-full rounded-xl border border-border-subtle bg-surface px-4 text-sm font-semibold text-foreground shadow-sm outline-none focus:ring-4 focus:ring-brand-soft"
          />
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-muted px-4 py-3">
          <input
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            type="checkbox"
            className="h-4 w-4 rounded border-border-subtle"
          />
          <span className="text-sm font-semibold text-foreground">
            Kích hoạt cho đặt lịch mới
          </span>
        </label>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-danger">{error}</p>}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-bold text-background shadow-sm transition-colors hover:bg-muted"
        >
          Lưu cấu hình
        </button>
      </div>
    </section>
  );
}
