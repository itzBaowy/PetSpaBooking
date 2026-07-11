"use client";

import Link from "next/link";
import { useState } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { Pagination } from "@/components/ui/pagination";
import { entitySchema, textValue } from "@/apis/admin/supported-api";
import {
  LoadState,
  useAdminDetail,
  displayValue,
  DetailItem,
  EntityFields,
  EntityTable,
  StatusPill,
  errorMessage,
} from "../shared";

export function AdminBookingDetailPage({ id }: { id: string }) {
  const [txPage, setTxPage] = useState(1);
  const txPageSize = 5;
  const query = useAdminDetail("booking", id ? API_ENDPOINTS.ADMIN.BOOKINGS.DETAIL(id) : null);
  const finance = useAdminDetail("booking-finance", id ? API_ENDPOINTS.ADMIN.BOOKINGS.FINANCE(id) : null);

  if (query.isLoading) return <p>Đang tải...</p>;
  if (query.isError || !query.data) return <LoadState error={query.error ?? new Error("Không tìm thấy lịch đặt.")} retry={() => void query.refetch()} />;

  const relations = ["customer", "provider", "service", "dispute", "review"] as const;
  const relationLabels = { customer: "Khách hàng", provider: "Nhà cung cấp", service: "Dịch vụ", dispute: "Tranh chấp", review: "Đánh giá" };
  const allTransactions = Array.isArray(query.data.walletTransactions)
    ? query.data.walletTransactions.flatMap((x: unknown) => { const parsed = entitySchema.safeParse(x); return parsed.success ? [parsed.data] : []; })
    : [];
  const totalTxPages = Math.ceil(allTransactions.length / txPageSize) || 1;
  const pagedTransactions = allTransactions.slice((txPage - 1) * txPageSize, txPage * txPageSize);
  const b = query.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/bookings" className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors">
          &larr; Quay lại danh sách lịch đặt
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-brand-soft/20 blur-2xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-foreground">Lịch đặt #{textValue(id).slice(-8).toUpperCase()}</h2>
              <p className="text-sm text-muted">ID: {id}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusPill value={b.status} />
                <StatusPill value={b.paymentStatus} />
                <StatusPill value={b.paymentMethod} />
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted">Tổng tiền</p>
            <p className="text-2xl font-extrabold text-foreground">{displayValue(b.totalAmount, "totalAmount")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="font-bold text-foreground">Thông tin lịch hẹn</h3>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="status" value={b.status} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <DetailItem label="appointmentStart" value={b.appointmentStart} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <DetailItem label="createAt" value={b.createAt} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <DetailItem label="updateAt" value={b.updateAt} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
          </dl>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="font-bold text-foreground">Thông tin thanh toán</h3>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="totalAmount" value={b.totalAmount} icon={<svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <DetailItem label="paymentMethod" value={b.paymentMethod} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
            <DetailItem label="paymentStatus" value={b.paymentStatus} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
            <DetailItem label="customerId" value={b.customerId} icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
          </dl>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(["customer", "provider", "service"] as const).map(key => (
          <section key={key} className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-foreground border-b border-border-subtle pb-2">{relationLabels[key]}</h3>
            {b[key] && typeof b[key] === "object"
              ? <EntityFields entity={entitySchema.catch({ id: "" }).parse(b[key])} />
              : <p className="text-sm text-muted">Không có dữ liệu.</p>}
          </section>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {(["dispute", "review"] as const).map(key => (
          <section key={key} className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-foreground border-b border-border-subtle pb-2">{relationLabels[key]}</h3>
            {b[key] && typeof b[key] === "object"
              ? <EntityFields entity={entitySchema.catch({ id: "" }).parse(b[key])} />
              : <p className="text-sm text-muted">Không có dữ liệu.</p>}
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
          <h3 className="font-bold text-foreground">Đối soát tài chính</h3>
        </div>
        {finance.data ? <EntityFields entity={finance.data} /> : finance.isError ? <p className="text-sm text-red-700">{errorMessage(finance.error)}</p> : <p className="text-sm text-muted">Đang tải dữ liệu tài chính...</p>}
      </section>

      <section className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 className="font-bold text-foreground">Giao dịch ví ({allTransactions.length})</h3>
        </div>
        <EntityTable loading={false} items={pagedTransactions} columns={["type", "balanceType", "amount", "balanceAfter", "createAt"]} />
        {totalTxPages > 1 && (
          <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-3">
            <Pagination page={txPage} totalPages={totalTxPages} pageSize={txPageSize} onPageChange={setTxPage} />
          </div>
        )}
      </section>
    </div>
  );
}
