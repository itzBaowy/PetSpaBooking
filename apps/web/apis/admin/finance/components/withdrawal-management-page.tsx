"use client";

import { useState } from "react";
import { Button, CustomSelect, DataTable, PageHeader, Textarea } from "@/components/ui";
import type { DataTableColumn } from "@/components/ui";
import { withdrawalDecisionSchema } from "../schema";
import type { WithdrawalRequest } from "../queries";
import { formatCurrency } from "./finance-format";

const statusLabels: Record<WithdrawalRequest["status"], string> = {
  PENDING: "Cho duyet",
  APPROVED: "Da duyet",
  REJECTED: "Tu choi",
  PAID: "Da chi tra",
};

export function WithdrawalManagementPage() {
  const [items, setItems] = useState<WithdrawalRequest[]>([]);
  const [selected, setSelected] = useState<WithdrawalRequest | null>(null);
  const [decision, setDecision] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const columns: Array<DataTableColumn<WithdrawalRequest>> = [
    { key: "id", header: "Ma yeu cau", render: (item) => <span className="font-bold">{item.id}</span> },
    {
      key: "provider",
      header: "Nha cung cap",
      render: (item) => (
        <div>
          <p className="font-semibold">{item.providerName}</p>
          <p className="text-xs text-muted">So du: {formatCurrency(item.availableBalance ?? 0)}</p>
        </div>
      ),
    },
    { key: "amount", header: "So tien rut", render: (item) => <span className="font-bold">{formatCurrency(item.amount)}</span> },
    { key: "bank", header: "Tai khoan nhan", render: (item) => <div><p>{item.bankName}</p><p className="text-xs text-muted">{item.bankAccount}</p></div> },
    { key: "requestedAt", header: "Thoi gian", render: (item) => item.requestedAt },
    { key: "status", header: "Trang thai", render: (item) => <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold">{statusLabels[item.status]}</span> },
    { key: "action", header: "Thao tac", align: "right", isAction: true, render: (item) => item.status === "PENDING" ? <Button className="h-9 px-4" onClick={() => setSelected(item)}>Xet duyet</Button> : null },
  ];

  function resolve() {
    if (!selected) return;
    const result = withdrawalDecisionSchema.safeParse({ requestId: selected.id, decision, reason });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Du lieu khong hop le");
      return;
    }
    setItems((current) => current.map((item) => item.id === selected.id ? { ...item, status: decision === "APPROVE" ? "APPROVED" : "REJECTED" } : item));
    setSelected(null);
    setReason("");
    setError("");
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Quan tri / Tai chinh"
        title="Yeu cau rut tien"
        description="Man hinh legacy nay khong con dung mock data. Route admin withdrawals moi se dung API that."
      />
      <DataTable columns={columns} data={items} getRowKey={(item) => item.id} minWidthClassName="min-w-[1050px]" />
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl">
            <h2 className="text-xl font-bold">Xet duyet {selected.id}</h2>
            <p className="mt-1 text-sm text-muted">{selected.providerName} - {formatCurrency(selected.amount)}</p>
            <div className="mt-5 space-y-4">
              <CustomSelect value={decision} options={[{ label: "Duyet yeu cau", value: "APPROVE" }, { label: "Tu choi yeu cau", value: "REJECT" }]} onValueChange={(value) => setDecision(value as "APPROVE" | "REJECT")} />
              <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Nhap ket qua kiem tra va ly do..." />
              {error && <p className="text-sm font-semibold text-danger">{error}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>Huy</Button>
              <Button onClick={resolve}>Luu quyet dinh</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
