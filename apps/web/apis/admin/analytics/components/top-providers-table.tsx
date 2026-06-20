"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { cn, formatInitials } from "@/lib/utils";

interface ProviderData {
  firstName: string;
  lastName: string;
  shopName: string;
  bookings: number;
  revenue: number;
  rating: number;
  reviews: number;
}

const PROVIDERS: ProviderData[] = [
  {
    firstName: "Anh",
    lastName: "Nguyen",
    shopName: "Happy Paws Spa",
    bookings: 342,
    revenue: 38400000,
    rating: 4.9,
    reviews: 124,
  },
  {
    firstName: "Binh",
    lastName: "Tran",
    shopName: "Pet Haven Grooming",
    bookings: 298,
    revenue: 29500000,
    rating: 4.8,
    reviews: 98,
  },
  {
    firstName: "Chi",
    lastName: "Le",
    shopName: "Royal Pet Care",
    bookings: 256,
    revenue: 27800000,
    rating: 4.7,
    reviews: 86,
  },
  {
    firstName: "Duy",
    lastName: "Pham",
    shopName: "Meow & Woof Salon",
    bookings: 212,
    revenue: 21900000,
    rating: 4.6,
    reviews: 72,
  },
  {
    firstName: "Huong",
    lastName: "Vu",
    shopName: "Golden Pet Wellness",
    bookings: 189,
    revenue: 19800000,
    rating: 4.9,
    reviews: 54,
  },
];

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-amber-100 text-amber-800",
  "bg-purple-100 text-purple-800",
  "bg-rose-100 text-rose-800",
];

type SortKey = "bookings" | "revenue";
type SortDirection = "asc" | "desc";

function SortButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-end gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-900"
    >
      {label}
      <span className="flex flex-col items-center gap-0.5" aria-hidden="true">
        <span
          className={cn(
            "h-0 w-0 border-x-4 border-b-[5px] border-x-transparent",
            active && direction === "asc"
              ? "border-b-gray-950"
              : "border-b-gray-300",
          )}
        />
        <span
          className={cn(
            "h-0 w-0 border-x-4 border-t-[5px] border-x-transparent",
            active && direction === "desc"
              ? "border-t-gray-950"
              : "border-t-gray-300",
          )}
        />
      </span>
    </button>
  );
}

export function TopProvidersTable() {
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const records = [...PROVIDERS].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * multiplier;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("desc");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-50 p-6 pb-4">
        <h3 className="font-semibold text-gray-800">Nhà cung cấp nổi bật</h3>
        <span className="text-xs font-normal text-gray-400">
          Theo doanh thu tháng
        </span>
      </div>

      <table className="w-full table-fixed border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/75">
            <th className="w-[52%] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Nhà cung cấp
            </th>
            <th className="w-[20%] px-6 py-3 text-right">
              <SortButton
                label="Đặt lịch"
                active={sortKey === "bookings"}
                direction={sortDirection}
                onClick={() => handleSort("bookings")}
              />
            </th>
            <th className="w-[28%] px-6 py-3 text-right">
              <SortButton
                label="Doanh thu"
                active={sortKey === "revenue"}
                direction={sortDirection}
                onClick={() => handleSort("revenue")}
              />
            </th>
          </tr>
        </thead>
      </table>

      <div className="max-h-250 overflow-y-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <tbody className="divide-y divide-gray-100">
            {records.map((provider, index) => {
              const initials = formatInitials(
                provider.firstName,
                provider.lastName,
              );
              const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];

              return (
                <tr
                  key={provider.shopName}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="w-[52%] px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          colorClass,
                        )}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-gray-800">
                          {provider.shopName}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <span>
                            {provider.firstName} {provider.lastName}
                          </span>
                          <span className="text-gray-300">-</span>
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <svg
                              className="h-3 w-3 fill-amber-500"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-medium text-gray-600">
                              {provider.rating}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="w-[20%] px-6 py-3.5 text-right text-sm font-medium text-gray-600">
                    {provider.bookings}
                  </td>
                  <td className="w-[28%] px-6 py-3.5 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(provider.revenue, "VND")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
