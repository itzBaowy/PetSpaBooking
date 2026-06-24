"use client";

import { useState } from "react";
import { Button, CustomSelect, DataTable, PageHeader, Textarea } from "@/components/ui";
import type { DataTableColumn } from "@/components/ui";
import { withdrawalDecisionSchema } from "../schema";
import { withdrawalMockItems, type WithdrawalRequest } from "../queries";
import { formatCurrency } from "./finance-format";

const statusLabels = { PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Từ chối", PAID: "Đã chi trả" };

export function WithdrawalManagementPage() {
  const [items, setItems] = useState(withdrawalMockItems);
  const [selected, setSelected] = useState<WithdrawalRequest | null>(null);
  const [decision, setDecision] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const columns: Array<DataTableColumn<WithdrawalRequest>> = [
    { key: "id", header: "Mã yêu cầu", render: (item) => <span className="font-bold">{item.id}</span> },
    { key: "provider", header: "Nhà cung cấp", render: (item) => <div><p className="font-semibold">{item.providerName}</p><p className="text-xs text-muted">Số dư: {formatCurrency(item.availableBalance)}</p></div> },
    { key: "amount", header: "Số tiền rút", render: (item) => <span className="font-bold">{formatCurrency(item.amount)}</span> },
    { key: "bank", header: "Tài khoản nhận", render: (item) => <div><p>{item.bankName}</p><p className="text-xs text-muted">{item.bankAccount}</p></div> },
    { key: "requestedAt", header: "Thời gian", render: (item) => item.requestedAt },
    { key: "status", header: "Trạng thái", render: (item) => <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold">{statusLabels[item.status]}</span> },
    { key: "action", header: "Thao tác", align: "right", isAction: true, render: (item) => item.status === "PENDING" ? <Button className="h-9 px-4" onClick={() => setSelected(item)}>Xét duyệt</Button> : null },
  ];

  function resolve() {
    if (!selected) return;
    const result = withdrawalDecisionSchema.safeParse({ requestId: selected.id, decision, reason });
    if (!result.success) { setError(result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ"); return; }
    setItems((current) => current.map((item) => item.id === selected.id ? { ...item, status: decision === "APPROVE" ? "APPROVED" : "REJECTED" } : item));
    setSelected(null); setReason(""); setError("");
  }

  return <div className="space-y-6 p-6">
    <PageHeader eyebrow="Quản trị / Tài chính" title="Yêu cầu rút tiền" description="Kiểm tra số dư, tài khoản nhận và phê duyệt yêu cầu rút tiền của nhà cung cấp." />
    <DataTable columns={columns} data={items} getRowKey={(item) => item.id} minWidthClassName="min-w-[1050px]" />
    {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4"><div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl"><h2 className="text-xl font-bold">Xét duyệt {selected.id}</h2><p className="mt-1 text-sm text-muted">{selected.providerName} · {formatCurrency(selected.amount)}</p><div className="mt-5 space-y-4"><CustomSelect value={decision} options={[{ label: "Duyệt yêu cầu", value: "APPROVE" }, { label: "Từ chối yêu cầu", value: "REJECT" }]} onValueChange={(value) => setDecision(value as "APPROVE" | "REJECT")} /><Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Nhập kết quả kiểm tra và lý do (ít nhất 10 ký tự)..." />{error && <p className="text-sm font-semibold text-danger">{error}</p>}</div><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setSelected(null)}>Hủy</Button><Button onClick={resolve}>Lưu quyết định</Button></div></div></div>}
  </div>;
}
