"use client";

import { useState } from "react";
import { Button, Input, PageHeader } from "@/components/ui";
import { useToast } from "@/components/ui/feedback-provider";
import { depositConfigSchema } from "../schema";

const DEV_ONLY_DEPOSIT_CONFIG = {
  minimumDeposit: 2_000_000,
  warningThreshold: 1_500_000,
  restrictionThreshold: 500_000,
  commissionRate: 15,
};

export function DepositConfigPage() {
  const [values, setValues] = useState(DEV_ONLY_DEPOSIT_CONFIG);
  const { showToast } = useToast();

  function update(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: Number(value) }));
  }

  function save() {
    const result = depositConfigSchema.safeParse(values);
    if (!result.success) {
      showToast(
        result.error.issues[0]?.message ?? "Cấu hình không hợp lệ.",
        "error",
      );
      return;
    }

    // TODO(BE): PATCH /api/admin/config/deposit.
    showToast("BE chưa hỗ trợ API lưu cấu hình ký quỹ.", "info");
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        backHref="/admin/finance/ledger"
        backLabel="Quay lại tài chính"
        eyebrow="Quản trị / Tài chính"
        title="Cấu hình ký quỹ"
        description="Thiết lập mức ký quỹ tối thiểu và ngưỡng cảnh báo/hạn chế nhận booking."
      />
      <div className="max-w-3xl rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <ConfigField
            label="Ký quỹ tối thiểu (VND)"
            value={values.minimumDeposit}
            onChange={(value) => update("minimumDeposit", value)}
          />
          <ConfigField
            label="Ngưỡng cảnh báo (VND)"
            value={values.warningThreshold}
            onChange={(value) => update("warningThreshold", value)}
          />
          <ConfigField
            label="Ngưỡng hạn chế booking (VND)"
            value={values.restrictionThreshold}
            onChange={(value) => update("restrictionThreshold", value)}
          />
          <ConfigField
            label="Hoa hồng mặc định (%)"
            value={values.commissionRate}
            onChange={(value) => update("commissionRate", value)}
          />
        </div>
        <div className="mt-6 rounded-xl bg-warning-soft p-4 text-sm leading-6 text-muted">
          Khi ký quỹ thấp hơn ngưỡng hạn chế, nhà cung cấp không được nhận
          booking mới. Dữ liệu hiện tại chỉ dùng để demo cho đến khi BE cung cấp
          API cấu hình.
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={save}>Lưu cấu hình</Button>
        </div>
      </div>
    </div>
  );
}

function ConfigField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
