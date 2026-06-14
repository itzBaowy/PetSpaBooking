"use client";

import { useState } from "react";
import Link from "next/link";
import { ActionMenu } from "@/components/ui/action-menu";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { useAdminBookings } from "../queries";
import type { AdminBooking } from "../queries";

const bookingStatusStyles = {
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-700",
  CONFIRMED: "border-blue-200 bg-blue-50 text-blue-700",
  IN_PROGRESS: "border-purple-200 bg-purple-50 text-purple-700",
  COMPLETED: "border-green-200 bg-green-50 text-green-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

const paymentStatusStyles = {
  UNPAID: "border-gray-200 bg-gray-50 text-gray-700",
  PAID: "border-green-200 bg-green-50 text-green-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  REFUNDED: "border-blue-200 bg-blue-50 text-blue-700",
};

export function SystemBookingTable() {
  const bookings = useAdminBookings();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const total = bookings.data.length;
  const totalPages = Math.ceil(total / pageSize);
  const records = bookings.data.slice((page - 1) * pageSize, page * pageSize);
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
      header: "Booking",
      widthClassName: "w-[18%]",
      render: (booking) => (
        <div>
          <p className="font-semibold text-gray-900">{booking.id}</p>
          <p className="text-xs text-gray-500">{booking.service}</p>
        </div>
      ),
    },
    {
      key: "petOwner",
      header: "Pet Owner",
      widthClassName: "w-[15%]",
      render: (booking) => booking.petOwner,
    },
    {
      key: "provider",
      header: "Provider",
      widthClassName: "w-[16%]",
      render: (booking) => booking.provider,
    },
    {
      key: "schedule",
      header: "Schedule",
      widthClassName: "w-[15%]",
      render: (booking) => booking.scheduledAt,
    },
    {
      key: "payment",
      header: "Payment",
      widthClassName: "w-[12%]",
      render: (booking) => (
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${paymentStatusStyles[booking.paymentStatus]}`}
        >
          {booking.paymentStatus}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      widthClassName: "w-[12%]",
      render: (booking) => (
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${bookingStatusStyles[booking.status]}`}
        >
          {booking.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      isAction: true,
      widthClassName: "w-[8%]",
      render: () => (
        <ActionMenu
          items={[
            { label: "View booking" },
            { label: "Adjust status" },
            { label: "Open dispute" },
            { label: "Cancel booking", variant: "danger" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <nav className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Admin / Booking Monitoring
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            System Bookings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Monitor every platform booking and identify cases needing admin
            intervention.
          </p>
        </div>
        <Link
          href="/admin/bookings/disputes"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          Open disputes
        </Link>
      </div>

      <StatisticCardGrid columns={3}>
        <StatisticCard
          title="Total bookings shown"
          value={bookings.data.length}
        />
        <StatisticCard
          title="Open disputes"
          value={disputedBookings}
          tone="red"
        />
        <StatisticCard
          title="Tracked value"
          value={`${new Intl.NumberFormat("vi-VN").format(totalRevenue)} VND`}
          tone="green"
        />
      </StatisticCardGrid>

      <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-2 md:flex-row">
            <SearchInput
              value=""
              onChange={() => undefined}
              className="md:w-96"
              placeholder="Search booking, owner, provider..."
            />
            <CustomSelect
              className="md:w-56"
              options={[
                "All statuses",
                "PENDING",
                "CONFIRMED",
                "IN_PROGRESS",
                "COMPLETED",
                "CANCELLED",
              ]}
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={records}
          getRowKey={(booking) => booking.id}
          minWidthClassName="min-w-[1120px]"
        />
        <div className="border-t border-gray-100 px-5 py-4">
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
    </div>
  );
}
