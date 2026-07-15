"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionMenu } from "@/components/ui/action-menu";
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

      <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm">
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
        <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface shadow-sm">
          <table className="min-w-[1040px] w-full text-left">
            <thead className="bg-surface-muted text-xs font-extrabold uppercase text-subtle">
              <tr>
                {["Tranh chấp", "Booking", "Khách hàng", "Dịch vụ", "Checkout", "Giá trị", "Trạng thái", "Thao tác"].map((title) => (
                  <th key={title} className="px-4 py-3 last:text-right">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {disputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-surface-muted/50">
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      className="font-extrabold text-brand hover:text-brand-hover"
                      onClick={() => router.push(`/provider/disputes/${dispute.id}`)}
                    >
                      #{dispute.id.slice(-8)}
                    </button>
                    <p className="mt-1 max-w-56 truncate text-xs text-muted">{dispute.reason}</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold">#{(dispute.booking?.id ?? dispute.bookingId).slice(-8)}</td>
                  <td className="px-4 py-4 text-sm">{dispute.booking?.customer?.users?.fullName ?? "Khách hàng"}</td>
                  <td className="px-4 py-4 text-sm">{dispute.booking?.service?.name ?? "Dịch vụ"}</td>
                  <td className="px-4 py-4 text-sm text-muted">{providerDate(dispute.booking?.checkedOutAt ?? dispute.createdAt)}</td>
                  <td className="px-4 py-4 font-black">{providerMoney.format(dispute.booking?.totalAmount ?? 0)}</td>
                  <td className="px-4 py-4"><ProviderBadge value={dispute.status} /></td>
                  <td className="px-4 py-4 text-right">
                    <ActionMenu
                      items={[
                        {
                          label: "Xem tranh chấp",
                          onClick: () => router.push(`/provider/disputes/${dispute.id}`),
                        },
                        {
                          label: "Xem booking",
                          onClick: () => router.push(`/provider/bookings/${dispute.bookingId}`),
                        },
                      ]}
                    />
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
