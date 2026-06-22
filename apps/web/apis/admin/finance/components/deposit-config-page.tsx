"use client";

import { useState } from "react";
import { Button, Input, PageHeader } from "@/components/ui";
import { depositConfigSchema } from "../schema";

export function DepositConfigPage() {
  const [values, setValues] = useState({ minimumDeposit: 2000000, warningThreshold: 1500000, restrictionThreshold: 500000, commissionRate: 15 });
  const [saved, setSaved] = useState(false);
  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: Number(value) }));
  const save = () => { if (depositConfigSchema.safeParse(values).success) { setSaved(true); window.setTimeout(() => setSaved(false), 2500); } };
  return <div className="space-y-6 p-6"><PageHeader backHref="/admin/finance/ledger" backLabel="Quay lại tài chính" eyebrow="Quản trị / Tài chính" title="Cấu hình ký quỹ" description="Thiết lập mức ký quỹ tối thiểu và ngưỡng cảnh báo/hạn chế nhận booking." />
    <div className="max-w-3xl rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm"><div className="grid gap-5 sm:grid-cols-2">
      <ConfigField label="Ký quỹ tối thiểu (VND)" value={values.minimumDeposit} onChange={(v) => update("minimumDeposit", v)} />
      <ConfigField label="Ngưỡng cảnh báo (VND)" value={values.warningThreshold} onChange={(v) => update("warningThreshold", v)} />
      <ConfigField label="Ngưỡng hạn chế booking (VND)" value={values.restrictionThreshold} onChange={(v) => update("restrictionThreshold", v)} />
      <ConfigField label="Hoa hồng mặc định (%)" value={values.commissionRate} onChange={(v) => update("commissionRate", v)} />
    </div><div className="mt-6 rounded-xl bg-warning-soft p-4 text-sm leading-6 text-muted">Khi ký quỹ thấp hơn ngưỡng hạn chế, Provider không được nhận booking mới. Thay đổi chỉ áp dụng sau khi lưu cấu hình.</div><div className="mt-6 flex items-center justify-end gap-3">{saved && <span className="text-sm font-semibold text-success">Đã lưu cấu hình mock</span>}<Button onClick={save}>Lưu cấu hình</Button></div></div></div>;
}

function ConfigField({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) { return <label className="space-y-2 text-sm font-semibold"><span>{label}</span><Input type="number" min={0} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
