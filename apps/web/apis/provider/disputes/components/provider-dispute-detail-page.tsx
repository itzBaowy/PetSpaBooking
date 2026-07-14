"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui";
import {
  ProviderBadge,
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerDate,
  providerErrorText,
  providerMoney,
} from "@/apis/provider/_shared/provider-ui";
import {
  type DisputeEvidence,
  useProviderDisputeDetail,
  useRespondProviderDispute,
} from "@/apis/provider/disputes/queries";

export function ProviderDisputeDetailPage({ disputeId }: { disputeId: string }) {
  const query = useProviderDisputeDetail(disputeId);
  const respond = useRespondProviderDispute();
  const { showToast } = useToast();
  const [response, setResponse] = useState("");
  const [evidence, setEvidence] = useState<DisputeEvidence[]>([]);
  const [formError, setFormError] = useState("");

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError || !query.data) {
    return <ProviderError error={query.error ?? new Error("Không tìm thấy tranh chấp.")} retry={() => void query.refetch()} />;
  }

  const dispute = query.data;
  const booking = dispute.booking;
  const canRespond = dispute.status === "PENDING";

  const submit = () => {
    const cleanResponse = response.trim();
    const cleanEvidence = evidence
      .map((item) => ({
        url: item.url.trim(),
        type: item.type?.trim() || undefined,
        title: item.title?.trim() || undefined,
        note: item.note?.trim() || undefined,
      }))
      .filter((item) => item.url);

    if (!cleanResponse) {
      setFormError("Vui lòng nhập phản hồi cho tranh chấp.");
      return;
    }

    respond.mutate(
      { disputeId: dispute.id, response: cleanResponse, evidence: cleanEvidence },
      {
        onSuccess: () => {
          setResponse("");
          setEvidence([]);
          setFormError("");
          showToast("Đã gửi phản hồi tranh chấp.", "success");
        },
        onError: (error) => showToast(providerErrorText(error), "error"),
      },
    );
  };

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title={`Tranh chấp #${dispute.id.slice(-8)}`}
        description="Chi tiết khiếu nại, bằng chứng và phản hồi provider từ API thật."
        action={<Link className="rounded-xl border border-border-muted px-4 py-2 text-sm font-bold" href="/provider/disputes">Quay lại</Link>}
      />

      <section className="grid gap-4 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm md:grid-cols-4">
        <Metric label="Trạng thái" value={<ProviderBadge value={dispute.status} />} />
        <Metric label="Booking" value={`#${dispute.bookingId.slice(-8)}`} />
        <Metric label="Thanh toán" value={`${booking?.paymentMethod ?? "-"} / ${booking?.paymentStatus ?? "-"}`} />
        <Metric label="Tổng tiền" value={providerMoney.format(booking?.totalAmount ?? 0)} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,.8fr)]">
        <div className="space-y-5">
          <Panel title="Khiếu nại của khách hàng">
            <p className="text-sm font-extrabold text-foreground">{dispute.reason}</p>
            {dispute.description ? <p className="mt-3 text-sm leading-7 text-muted">{dispute.description}</p> : null}
            <EvidenceList title="Bằng chứng khách hàng" items={dispute.evidence} />
          </Panel>

          <Panel title="Phản hồi provider">
            {dispute.providerResponse ? (
              <div className="rounded-xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-900">
                {dispute.providerResponse}
                {dispute.providerRespondedAt ? <p className="mt-2 text-xs font-semibold">Đã gửi: {providerDate(dispute.providerRespondedAt)}</p> : null}
              </div>
            ) : (
              <p className="text-sm text-muted">Provider chưa gửi phản hồi.</p>
            )}
            <EvidenceList title="Bằng chứng provider đã gửi" items={dispute.providerEvidence} />
          </Panel>

          {canRespond ? (
            <Panel title="Gửi phản hồi">
              <label className="block text-sm font-bold">
                Nội dung phản hồi *
                <Textarea
                  className="mt-2 min-h-36"
                  value={response}
                  onChange={(event) => {
                    setResponse(event.target.value);
                    setFormError("");
                  }}
                  placeholder="Giải thích quá trình cung cấp dịch vụ và phản hồi khiếu nại..."
                />
              </label>
              <EvidenceEditor items={evidence} onChange={setEvidence} />
              {formError ? <p className="text-sm font-bold text-danger">{formError}</p> : null}
              <Button disabled={respond.isPending} onClick={submit}>
                {respond.isPending ? "Đang gửi..." : "Gửi phản hồi"}
              </Button>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-5">
          <Panel title="Thông tin booking">
            <dl className="grid gap-3">
              <Field label="Khách hàng" value={booking?.customer?.users?.fullName ?? "Khách hàng"} />
              <Field label="Số điện thoại" value={booking?.customer?.users?.phone ?? "-"} />
              <Field label="Dịch vụ" value={booking?.service?.name ?? "Dịch vụ"} />
              <Field label="Trạng thái booking" value={booking?.status ?? "-"} />
              <Field label="Checkout" value={providerDate(booking?.checkedOutAt)} />
              <Field label="Ngày tạo tranh chấp" value={providerDate(dispute.createdAt)} />
            </dl>
          </Panel>

          {dispute.adminNote || dispute.resolvedAt ? (
            <Panel title="Kết quả admin">
              {dispute.adminNote ? <p className="text-sm leading-7 text-muted">{dispute.adminNote}</p> : null}
              {dispute.resolvedAt ? <p className="mt-2 text-xs font-semibold text-subtle">Đã xử lý: {providerDate(dispute.resolvedAt)}</p> : null}
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <h2 className="text-base font-extrabold text-foreground">{title}</h2>
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

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-surface-muted p-3">
      <dt className="text-xs font-bold uppercase text-subtle">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function EvidenceList({ title, items }: { title: string; items: DisputeEvidence[] }) {
  return (
    <div>
      <h3 className="text-sm font-extrabold">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 rounded-xl border border-dashed border-border-muted p-4 text-sm text-muted">Chưa có evidence.</p>
      ) : (
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <a
              key={`${item.url}-${index}`}
              className="rounded-xl border border-border-subtle p-3 text-sm hover:border-brand"
              href={item.url}
              target="_blank"
              rel="noreferrer"
            >
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
        <h3 className="text-sm font-extrabold">Evidence URL</h3>
        <Button type="button" variant="outline" onClick={add} disabled={items.length >= 10}>Thêm URL</Button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-xl border border-border-subtle p-3 sm:grid-cols-2">
          <Input className="sm:col-span-2" value={item.url} onChange={(event) => update(index, { url: event.target.value })} placeholder="https://..." />
          <Input value={item.title ?? ""} onChange={(event) => update(index, { title: event.target.value })} placeholder="Tiêu đề" />
          <Input value={item.type ?? ""} onChange={(event) => update(index, { type: event.target.value })} placeholder="image, video, document..." />
          <Input className="sm:col-span-2" value={item.note ?? ""} onChange={(event) => update(index, { note: event.target.value })} placeholder="Ghi chú" />
          <Button type="button" variant="outline" onClick={() => onChange(items.filter((_, current) => current !== index))}>Xóa URL</Button>
        </div>
      ))}
    </div>
  );
}
