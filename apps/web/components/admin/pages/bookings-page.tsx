"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  PageTitle,
  LoadState,
  useAdminList,
  FilterSelect,
  EntityTable,
  Pager,
  inputClass,
} from "../shared";

export function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const query = useAdminList("bookings", API_ENDPOINTS.ADMIN.BOOKINGS.LIST, {
    page,
    pageSize,
    status,
    paymentMethod,
    paymentStatus,
    bookingId,
    providerId,
    customerId,
    from,
    to,
  });

  if (query.isError) return <LoadState error={query.error} retry={() => void query.refetch()} />;

  const statusOptions = [
    { value: "", label: "Mọi trạng thái" },
    { value: "PENDING", label: "Đang chờ" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "CHECKED_IN", label: "Đã nhận khách" },
    { value: "CHECKED_OUT", label: "Đã hoàn tất dịch vụ" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
    { value: "REJECTED", label: "Đã từ chối" },
    { value: "DISPUTE", label: "Đang tranh chấp" },
    { value: "NO_ARRIVAL", label: "Không đến" },
  ];

  const paymentMethodOptions = [
    { value: "", label: "Mọi phương thức" },
    { value: "CASH", label: "Tiền mặt" },
    { value: "ONLINE", label: "Trực tuyến" },
  ];

  const paymentStatusOptions = [
    { value: "", label: "Mọi thanh toán" },
    { value: "UNPAID", label: "Chưa thanh toán" },
    { value: "PENDING", label: "Đang chờ" },
    { value: "SUCCESS", label: "Thành công" },
    { value: "FAILED", label: "Thất bại" },
    { value: "REFUNDED", label: "Đã hoàn tiền" },
  ];

  return (
    <div className="space-y-5">
      <PageTitle title="Lịch đặt toàn hệ thống" description="Theo dõi lịch đặt; backend không cung cấp thao tác ghi đè trạng thái." />
      <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <FilterSelect
            className="w-full sm:w-48"
            value={status}
            options={statusOptions}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          />
          <FilterSelect
            className="w-full sm:w-48"
            value={paymentMethod}
            options={paymentMethodOptions}
            onChange={(v) => {
              setPaymentMethod(v);
              setPage(1);
            }}
          />
          <FilterSelect
            className="w-full sm:w-48"
            value={paymentStatus}
            options={paymentStatusOptions}
            onChange={(v) => {
              setPaymentStatus(v);
              setPage(1);
            }}
          />
          <input
            value={bookingId}
            onChange={(e) => {
              setBookingId(e.target.value);
              setPage(1);
            }}
            placeholder="Mã booking"
            className={inputClass}
          />
          <input
            value={providerId}
            onChange={(e) => {
              setProviderId(e.target.value);
              setPage(1);
            }}
            placeholder="Mã nhà cung cấp"
            className={inputClass}
          />
          <input
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setPage(1);
            }}
            placeholder="Mã khách hàng"
            className={inputClass}
          />
          <input
            title="Từ ngày"
            type="datetime-local"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          />
          <input
            title="Đến ngày"
            type="datetime-local"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          />
          <span className="w-full self-center text-sm font-medium text-muted sm:ml-auto sm:w-auto">
            {query.isFetching ? "Đang tải..." : `${query.data?.pagination.totalItems ?? 0} lịch đặt`}
          </span>
        </div>
      </div>
      <EntityTable
        loading={query.isLoading}
        items={query.data?.items}
        columns={[
          "bookingId",
          "customer.users.fullName",
          "provider.businessName",
          "service.name",
          "status",
          "totalAmount",
          "appointmentStart",
        ]}
        renderers={{
          bookingId: (item) => (
            <span className="block max-w-[220px] break-all font-mono text-xs leading-5 text-muted">
              {item.id}
            </span>
          ),
          "customer.users.fullName": (item) => (
            <span className="block min-w-0 break-words font-semibold text-foreground">
              {item.customer && typeof item.customer === "object"
                ? ((item.customer as { users?: { fullName?: string; userName?: string; email?: string } }).users?.fullName
                  ?? (item.customer as { users?: { fullName?: string; userName?: string; email?: string } }).users?.userName
                  ?? (item.customer as { users?: { fullName?: string; userName?: string; email?: string } }).users?.email
                  ?? "—")
                : "—"}
            </span>
          ),
        }}
        columnOptions={{
          bookingId: {
            widthClassName: "w-[220px]",
            headerClassName: "whitespace-nowrap",
            cellClassName: "align-top",
          },
          "customer.users.fullName": {
            widthClassName: "w-[220px]",
            headerClassName: "whitespace-nowrap",
            cellClassName: "align-top",
          },
        }}
        detailBase="/admin/bookings/detail"
      />
      <Pager data={query.data} setPage={setPage} setPageSize={setPageSize} />
    </div>
  );
}
