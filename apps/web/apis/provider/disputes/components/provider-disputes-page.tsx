"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  ProviderBadge,
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  ProviderPagination,
  ProviderPageHeader,
  providerDate,
  providerMoney,
} from "@/apis/provider/_shared/provider-ui";
import { useProviderDisputes } from "@/apis/provider/disputes/queries";

export function ProviderDisputesPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const query = useProviderDisputes({ page, pageSize, status: status || undefined });

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }

  const disputes = query.data?.items ?? [];

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Tranh chấp"
        description="Theo dõi và phản hồi tranh chấp từ API provider dispute."
      />

      <div className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <CustomSelect
            className="w-full sm:w-64"
            value={status}
            options={[
              { value: "", label: "Mọi trạng thái" },
              { value: "PENDING", label: "Đang chờ xử lý" },
              { value: "RESOLVED_PROVIDER_WIN", label: "Provider thắng" },
              { value: "RESOLVED_CUSTOMER_WIN", label: "Khách hàng thắng" },
              { value: "CANCELLED", label: "Đã hủy" },
            ]}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          <span className="w-full text-sm font-medium text-muted sm:ml-auto sm:w-auto">
            {query.isFetching ? "Đang tải..." : `${query.data?.pagination.totalItems ?? 0} tranh chấp`}
          </span>
        </div>
      </div>

      {disputes.length === 0 ? (
        <ProviderEmpty text="Không có tranh chấp phù hợp." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead className="bg-emerald-50/80 text-xs font-extrabold uppercase tracking-wide text-emerald-800">
              <tr>
                {["Tranh chấp", "Booking", "Khách hàng", "Dịch vụ", "Checkout", "Giá trị", "Trạng thái", "Thao tác"].map((title) => (
                  <th key={title} className="px-3 py-3.5 last:text-center">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {disputes.map((dispute) => (
                <tr key={dispute.id} className="transition-colors hover:bg-emerald-50/35">
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      className="font-extrabold text-emerald-600 hover:text-emerald-800 hover:underline"
                      onClick={() => router.push(`/provider/disputes/${dispute.id}`)}
                    >
                      #{dispute.id.slice(-8)}
                    </button>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{dispute.reason}</p>
                  </td>
                  <td className="break-all px-3 py-4 text-sm font-extrabold text-slate-800">#{(dispute.booking?.id ?? dispute.bookingId).slice(-8)}</td>
                  <td className="break-words px-3 py-4 text-sm">{dispute.booking?.customer?.users?.fullName ?? "Khách hàng"}</td>
                  <td className="break-words px-3 py-4 text-sm leading-5">{dispute.booking?.service?.name ?? "Dịch vụ"}</td>
                  <td className="px-3 py-4 text-sm leading-5 text-muted">{providerDate(dispute.booking?.checkedOutAt ?? dispute.createdAt)}</td>
                  <td className="whitespace-nowrap px-3 py-4 font-black text-slate-900">{providerMoney.format(dispute.booking?.totalAmount ?? 0)}</td>
                  <td className="px-3 py-4"><ProviderBadge value={dispute.status} /></td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col items-stretch gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/provider/bookings/${dispute.bookingId}`)}
                        className="inline-flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <BookingIcon />
                        Booking
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/provider/disputes/${dispute.id}`)}
                        className="inline-flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        <EyeIcon />
                        Tranh chấp
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {query.data?.pagination ? (
        <ProviderPagination
          page={query.data.pagination.page}
          pageSize={query.data.pagination.pageSize}
          totalItems={query.data.pagination.totalItems}
          totalPages={query.data.pagination.totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function BookingIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}
