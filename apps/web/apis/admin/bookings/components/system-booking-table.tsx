"use client";

import Link from "next/link";
import { useAdminBookings } from "../queries";

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
  const disputedBookings = bookings.data.filter(
    (booking) => booking.disputeStatus === "OPEN",
  ).length;
  const totalRevenue = bookings.data.reduce(
    (sum, booking) => sum + booking.amount,
    0,
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total bookings shown
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {bookings.data.length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Open disputes</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {disputedBookings}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Tracked value</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {new Intl.NumberFormat("vi-VN").format(totalRevenue)} VND
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm md:w-96"
              placeholder="Search booking, owner, provider..."
            />
            <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <option>All statuses</option>
              <option>PENDING</option>
              <option>CONFIRMED</option>
              <option>IN_PROGRESS</option>
              <option>COMPLETED</option>
              <option>CANCELLED</option>
            </select>
          </div>
          <div className="text-sm font-medium text-gray-500">
            Showing 1-3 of 3 bookings
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3">Booking</th>
                <th className="px-5 py-3">Pet Owner</th>
                <th className="px-5 py-3">Provider</th>
                <th className="px-5 py-3">Schedule</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {bookings.data.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">{booking.id}</p>
                    <p className="text-xs text-gray-500">{booking.service}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {booking.petOwner}
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {booking.provider}
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {booking.scheduledAt}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${paymentStatusStyles[booking.paymentStatus]}`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${bookingStatusStyles[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700">
                        View
                      </button>
                      <button className="rounded-md border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700">
                        Adjust status
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
