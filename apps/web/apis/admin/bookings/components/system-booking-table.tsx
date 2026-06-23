"use client";

import { useState } from "react";
import Link from "next/link";
import { ActionMenu } from "@/components/ui/action-menu";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import {
  StatisticCard,
  StatisticCardGrid,
} from "@/components/ui/statistic-card";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_OPTIONS,
} from "@/constants/booking-status";
import { useAdminBookings } from "../queries";
import type { AdminBooking } from "../queries";
import { BookingStatusOverrideDialog } from "./booking-status-override-dialog";

const bookingStatusStyles = {
  BOOKED: "border-warning-soft bg-warning-soft text-warning",
  CONFIRMED: "border-brand-soft bg-brand-soft text-brand",
  CHECKED_IN: "border-purple-100 bg-purple-50 text-purple-700",
  IN_SERVICE: "border-purple-100 bg-purple-50 text-purple-700",
  COMPLETED: "border-success-soft bg-success-soft text-success",
  COMMISSION_CHARGED: "border-success-soft bg-success-soft text-success",
  CANCELLED_BY_CUSTOMER: "border-danger-soft bg-danger-soft text-danger",
  CANCELLED_BY_PROVIDER: "border-danger-soft bg-danger-soft text-danger",
  NO_SHOW_REPORTED: "border-warning-soft bg-warning-soft text-warning",
  DISPUTED: "border-danger-soft bg-danger-soft text-danger",
  FAILED_APPROVED: "border-slate-200 bg-slate-100 text-slate-700",
};

const paymentStatusStyles = {
  UNPAID: "border-gray-200 bg-gray-50 text-gray-700",
  PAID: "border-green-200 bg-green-50 text-green-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  REFUNDED: "border-blue-200 bg-blue-50 text-blue-700",
};

const paymentStatusLabels = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

export function SystemBookingTable() {
  const bookings = useAdminBookings();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [overrideBooking, setOverrideBooking] = useState<AdminBooking | null>(
    null,
  );
  const filteredBookings = bookings.data.filter((booking) => {
    const matchesStatus = status === "ALL" || booking.status === status;
    const matchesSearch = [
      booking.id,
      booking.petOwner,
      booking.provider,
      booking.service,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  const total = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const records = filteredBookings.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const disputedBookings = bookings.data.filter(
    (booking) => booking.disputeStatus === "OPEN",
  ).length;
  const totalRevenue = bookings.data.reduce(
    (sum, booking) => sum + booking.amount,
    0,
  );
  const columns: Array<DataTableColumn<AdminBooking>> = [
    {
      key: "booking",
      header: "Đặt lịch",
      widthClassName: "w-[18%]",
      render: (booking) => (
        <div>
          <p className="font-semibold text-gray-900">{booking.id}</p>
          <p className="text-xs text-gray-500">
            {booking.service} / {booking.paymentMethod}
          </p>
        </div>
      ),
    },
    {
      key: "petOwner",
      header: "Chủ thú cưng",
      widthClassName: "w-[15%]",
      render: (booking) => booking.petOwner,
    },
    {
      key: "provider",
      header: "Nhà cung cấp",
      widthClassName: "w-[16%]",
      render: (booking) => booking.provider,
    },
    {
      key: "schedule",
      header: "Lịch hẹn",
      widthClassName: "w-[15%]",
      render: (booking) => booking.scheduledAt,
    },
    {
      key: "payment",
      header: "Thanh toán",
      widthClassName: "w-[12%]",
      render: (booking) => (
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${paymentStatusStyles[booking.paymentStatus]}`}
        >
          {paymentStatusLabels[booking.paymentStatus]}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      widthClassName: "w-[12%]",
      render: (booking) => (
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${bookingStatusStyles[booking.status]}`}
        >
          {BOOKING_STATUS_LABELS[booking.status]}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      isAction: true,
      widthClassName: "w-[8%]",
      render: (booking) => (
        <ActionMenu
          items={[
            { label: "Xem đặt lịch" },
            {
              label: "Điều chỉnh trạng thái",
              onClick: () => setOverrideBooking(booking),
            },
            { label: "Mở tranh chấp" },
            ...(booking.status === "NO_SHOW_REPORTED"
              ? [
                  {
                    label: "Duyệt vắng mặt",
                    onClick: () => {
                      window.location.href = "/admin/bookings/no-show";
                    },
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        eyebrow="Quản trị / Giám sát đặt lịch"
        title="Đặt lịch toàn hệ thống"
        description="Theo dõi toàn bộ đặt lịch và phát hiện trường hợp cần quản trị can thiệp."
        actions={
          <Link
            href="/admin/bookings/disputes"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            Tranh chấp đang mở
          </Link>
        }
      />

      <StatisticCardGrid columns={3}>
        <StatisticCard
          title="Tổng đặt lịch hiển thị"
          value={bookings.data.length}
        />
        <StatisticCard
          title="Tranh chấp đang mở"
          value={disputedBookings}
          tone="red"
        />
        <StatisticCard
          title="Giá trị theo dõi"
          value={`${new Intl.NumberFormat("vi-VN").format(totalRevenue)} VND`}
          tone="green"
        />
      </StatisticCardGrid>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-2 md:flex-row">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              className="md:w-96"
              placeholder="Tìm đặt lịch, chủ thú cưng, nhà cung cấp..."
            />
            <CustomSelect
              className="md:w-56"
              defaultValue="ALL"
              options={[
                { label: "Tất cả trạng thái", value: "ALL" },
                ...BOOKING_STATUS_OPTIONS,
              ]}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
          </div>
          <Link
            href="/admin/bookings/no-show"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border-subtle px-4 text-sm font-bold text-foreground hover:bg-surface-muted"
          >
            Hàng đợi vắng mặt
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={records}
          getRowKey={(booking) => booking.id}
          minWidthClassName="min-w-[1120px]"
        />
        <div className="px-2 py-1">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        </div>
      </div>
      {overrideBooking && (
        <BookingStatusOverrideDialog
          booking={overrideBooking}
          onClose={() => setOverrideBooking(null)}
        />
      )}
    </div>
  );
}
