"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui";
import type { DisputeEvidence } from "@/apis/provider/disputes/queries";
import { displayValue, errorMessage, LoadState, StatusPill, useAdminDetail } from "../shared";
import { nested, textValue } from "@/apis/admin/supported-api";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function AdminDisputeDetailPage({ id }: { id: string }) {
  const client = useQueryClient();
  const query = useAdminDetail("dispute", id ? API_ENDPOINTS.ADMIN.DISPUTES.DETAIL(id) : null);
  const { showToast } = useToast();
  const [adminNote, setAdminNote] = useState("");
  const [adminEvidence, setAdminEvidence] = useState<DisputeEvidence[]>([]);

  const mutation = useMutation({
    mutationFn: async (payload: { status: string; adminNote?: string; adminEvidence?: DisputeEvidence[] }) =>
      (await api.patch<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.DISPUTES.RESOLVE(id), payload)).data.data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin-real", "disputes"] });
      void client.invalidateQueries({ queryKey: ["admin-real", "dispute"] });
    },
  });

  if (query.isLoading) return <p>Đang tải...</p>;
  if (query.isError || !query.data) {
    return <LoadState error={query.error ?? new Error("Không tìm thấy tranh chấp.")} retry={() => void query.refetch()} />;
  }

  const dispute = query.data;
  const isPending = textValue(dispute.status) === "PENDING";
  const customerEvidence = toEvidence(dispute.evidence);
  const providerEvidence = toEvidence(dispute.providerEvidence);
  const resolvedAdminEvidence = toEvidence(dispute.adminEvidence);
  const booking = dispute.booking;

  const resolve = (status: string) => {
    const cleanEvidence = adminEvidence
      .map((item) => ({
        url: item.url.trim(),
        type: item.type?.trim() || undefined,
        title: item.title?.trim() || undefined,
        note: item.note?.trim() || undefined,
      }))
      .filter((item) => item.url);

    mutation.mutate(
      {
        status,
        ...(adminNote.trim() ? { adminNote: adminNote.trim() } : {}),
        ...(cleanEvidence.length ? { adminEvidence: cleanEvidence } : {}),
      },
      {
        onSuccess: () => {
          setAdminNote("");
          setAdminEvidence([]);
          showToast("Đã giải quyết tranh chấp.", "success");
        },
        onError: (error) => showToast(errorMessage(error), "error"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/bookings/disputes" className="text-sm font-semibold text-brand hover:text-brand-hover">
        &larr; Quay lại danh sách tranh chấp
      </Link>

      <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Tranh chấp #{id.slice(-8).toUpperCase()}</h2>
            <p className="mt-2 text-sm text-muted">Booking #{textValue(dispute.bookingId).slice(-8)}</p>
          </div>
          <StatusPill value={dispute.status} />
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm md:grid-cols-4">
        <Metric label="Khách hàng" value={textValue(nested(booking, "customer", "users", "fullName") ?? dispute.customerId)} />
        <Metric label="Provider" value={textValue(nested(booking, "provider", "businessName") ?? dispute.providerId)} />
        <Metric label="Dịch vụ" value={textValue(nested(booking, "service", "name"))} />
        <Metric label="Tổng tiền" value={money.format(Number(nested(booking, "totalAmount") ?? 0))} />
        <Metric label="Booking status" value={<StatusPill value={nested(booking, "status")} />} />
        <Metric label="Payment" value={`${textValue(nested(booking, "paymentMethod"))} / ${textValue(nested(booking, "paymentStatus"))}`} />
        <Metric label="Tạo lúc" value={displayValue(dispute.createdAt, "createdAt")} />
        <Metric label="Cập nhật" value={displayValue(dispute.updatedAt, "updatedAt")} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,.8fr)]">
        <div className="space-y-6">
          <Panel title="Khiếu nại khách hàng">
            <Field label="Lý do" value={dispute.reason} />
            <Field label="Mô tả" value={dispute.description} />
            <EvidenceList title="Evidence khách hàng" items={customerEvidence} />
          </Panel>

          <Panel title="Phản hồi provider">
            <Field label="Nội dung phản hồi" value={dispute.providerResponse} />
            <Field label="Thời gian phản hồi" value={displayValue(dispute.providerRespondedAt, "createdAt")} />
            <EvidenceList title="Evidence provider" items={providerEvidence} />
          </Panel>

          <Panel title="Kết quả xử lý">
            <Field label="Admin note" value={dispute.adminNote} />
            <Field label="Resolved by" value={dispute.resolvedBy} />
            <Field label="Resolved at" value={displayValue(dispute.resolvedAt, "resolvedAt")} />
            <EvidenceList title="Evidence admin" items={resolvedAdminEvidence} />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Chính sách giải quyết">
            <ul className="space-y-2 text-sm text-muted">
              <li><strong className="text-emerald-700">Provider thắng / hủy khiếu nại:</strong> booking hoàn tất và tính hoa hồng.</li>
              <li><strong className="text-blue-700">Khách hàng thắng:</strong> booking hủy, không tính hoa hồng và có thể tạo refund pending.</li>
            </ul>
          </Panel>

          {isPending ? (
            <Panel title="Hành động xử lý">
              <label className="block text-sm font-bold">
                Ghi chú admin
                <Textarea className="mt-2" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} placeholder="Nhập ghi chú xử lý..." />
              </label>
              <EvidenceEditor items={adminEvidence} onChange={setAdminEvidence} />
              <div className="grid gap-3">
                <Button disabled={mutation.isPending} onClick={() => resolve("RESOLVED_PROVIDER_WIN")} className="bg-emerald-600 hover:bg-emerald-700">
                  Provider thắng
                </Button>
                <Button disabled={mutation.isPending} onClick={() => resolve("RESOLVED_CUSTOMER_WIN")} className="bg-blue-600 hover:bg-blue-700">
                  Khách hàng thắng
                </Button>
                <Button disabled={mutation.isPending} onClick={() => resolve("CANCELLED")} className="bg-gray-600 hover:bg-gray-700">
                  Hủy khiếu nại
                </Button>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function toEvidence(value: unknown): DisputeEvidence[] {
  return Array.isArray(value)
    ? value
        .map((item) => {
          if (typeof item === "string") return { url: item };
          if (!item || typeof item !== "object") return null;
          const record = item as Record<string, unknown>;
          if (typeof record.url !== "string" || !record.url) return null;
          return {
            url: record.url,
            type: typeof record.type === "string" ? record.type : undefined,
            title: typeof record.title === "string" ? record.title : undefined,
            note: typeof record.note === "string" ? record.note : undefined,
          };
        })
        .filter((item): item is DisputeEvidence => Boolean(item))
    : [];
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <h3 className="font-bold text-foreground">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-subtle">{label}</p>
      <div className="mt-1 text-sm font-extrabold text-foreground">{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-subtle">{label}</p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">{textValue(value)}</p>
    </div>
  );
}

function EvidenceList({ title, items }: { title: string; items: DisputeEvidence[] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-subtle">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 rounded-xl border border-dashed border-border-muted p-4 text-sm text-muted">Chưa có evidence.</p>
      ) : (
        <div className="mt-2 grid gap-3">
          {items.map((item, index) => (
            <a key={`${item.url}-${index}`} className="rounded-xl border border-border-subtle p-3 text-sm hover:border-brand" href={item.url} target="_blank" rel="noreferrer">
              <strong className="block truncate">{item.title || item.url}</strong>
              <span className="mt-1 block text-xs text-muted">{item.type || "URL evidence"}</span>
              {item.note ? <span className="mt-2 block text-xs text-subtle">{item.note}</span> : null}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function EvidenceEditor({ items, onChange }: { items: DisputeEvidence[]; onChange: (items: DisputeEvidence[]) => void }) {
  const add = () => onChange([...items, { url: "", type: "image", title: "", note: "" }]);
  const update = (index: number, patch: Partial<DisputeEvidence>) => {
    onChange(items.map((item, current) => (current === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">Admin evidence URL</p>
        <Button type="button" variant="outline" onClick={add} disabled={items.length >= 10}>Thêm URL</Button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-xl border border-border-subtle p-3">
          <Input value={item.url} onChange={(event) => update(index, { url: event.target.value })} placeholder="https://..." />
          <Input value={item.title ?? ""} onChange={(event) => update(index, { title: event.target.value })} placeholder="Tiêu đề" />
          <Input value={item.type ?? ""} onChange={(event) => update(index, { type: event.target.value })} placeholder="image, video, document..." />
          <Input value={item.note ?? ""} onChange={(event) => update(index, { note: event.target.value })} placeholder="Ghi chú" />
          <Button type="button" variant="outline" onClick={() => onChange(items.filter((_, current) => current !== index))}>Xóa URL</Button>
        </div>
      ))}
    </div>
  );
}
