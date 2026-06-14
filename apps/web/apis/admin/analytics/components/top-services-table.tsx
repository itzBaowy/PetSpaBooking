"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface ServiceData {
  name: string;
  category: string;
  bookings: number;
  revenue: number;
  growth: string;
}

const SERVICES: ServiceData[] = [
  {
    name: "Luxury Dog Bathing & Blow Dry",
    category: "Spa & Bathing",
    bookings: 420,
    revenue: 16800000,
    growth: "+18.4%",
  },
  {
    name: "Full Cat Grooming & Haircut",
    category: "Grooming",
    bookings: 380,
    revenue: 22800000,
    growth: "+14.2%",
  },
  {
    name: "Aromatherapy Pet Massage",
    category: "Therapy & Spa",
    bookings: 290,
    revenue: 20300000,
    growth: "+22.1%",
  },
  {
    name: "Anti-Flea & Tick Treatment",
    category: "Treatment",
    bookings: 240,
    revenue: 12000000,
    growth: "+8.5%",
  },
  {
    name: "De-shedding & Undercoat Care",
    category: "Grooming",
    bookings: 195,
    revenue: 11700000,
    growth: "+5.7%",
  },
];

const CATEGORY_STYLES: Record<string, string> = {
  "Spa & Bathing": "bg-blue-50 text-blue-700 border-blue-100",
  Grooming: "bg-indigo-50 text-indigo-700 border-indigo-100",
  "Therapy & Spa": "bg-purple-50 text-purple-700 border-purple-100",
  Treatment: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

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
            "h-0 w-0 border-x-[4px] border-b-[5px] border-x-transparent",
            active && direction === "asc"
              ? "border-b-gray-950"
              : "border-b-gray-300",
          )}
        />
        <span
          className={cn(
            "h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent",
            active && direction === "desc"
              ? "border-t-gray-950"
              : "border-t-gray-300",
          )}
        />
      </span>
    </button>
  );
}

export function TopServicesTable() {
  const [sortKey, setSortKey] = useState<SortKey>("bookings");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const records = [...SERVICES].sort((a, b) => {
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
        <h3 className="font-semibold text-gray-800">Popular Services</h3>
        <span className="text-xs font-normal text-gray-400">
          By Bookings Volume
        </span>
      </div>

      <table className="w-full table-fixed border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/75">
            <th className="w-[52%] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Service Name
            </th>
            <th className="w-[20%] px-6 py-3 text-right">
              <SortButton
                label="Bookings"
                active={sortKey === "bookings"}
                direction={sortDirection}
                onClick={() => handleSort("bookings")}
              />
            </th>
            <th className="w-[28%] px-6 py-3 text-right">
              <SortButton
                label="Revenue"
                active={sortKey === "revenue"}
                direction={sortDirection}
                onClick={() => handleSort("revenue")}
              />
            </th>
          </tr>
        </thead>
      </table>

      <div className="max-h-[260px] overflow-y-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <tbody className="divide-y divide-gray-100">
            {records.map((service) => {
              const badgeStyle =
                CATEGORY_STYLES[service.category] ||
                "bg-gray-50 text-gray-700 border-gray-100";

              return (
                <tr
                  key={service.name}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="w-[52%] px-6 py-3.5">
                    <div className="truncate text-sm font-semibold text-gray-800">
                      {service.name}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded border px-2 py-0.5 text-[10px] font-semibold",
                          badgeStyle,
                        )}
                      >
                        {service.category}
                      </span>
                      <span className="flex items-center gap-0.5 rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">
                        {service.growth}
                      </span>
                    </div>
                  </td>
                  <td className="w-[20%] px-6 py-3.5 text-right text-sm font-medium text-gray-600">
                    {service.bookings}
                  </td>
                  <td className="w-[28%] px-6 py-3.5 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(service.revenue, "VND")}
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
