"use client";

import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface CardData {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  type: "users" | "bookings" | "revenue" | "providers";
  bgColor: string;
  textColor: string;
}

const CARDS: CardData[] = [
  {
    title: "Total Users",
    value: 4821,
    change: "+12.5%",
    isPositive: true,
    type: "users",
    bgColor: "bg-blue-50 text-blue-600",
    textColor: "text-blue-600",
  },
  {
    title: "Total Bookings",
    value: 1340,
    change: "+8.3%",
    isPositive: true,
    type: "bookings",
    bgColor: "bg-green-50 text-green-600",
    textColor: "text-green-600",
  },
  {
    title: "Platform Revenue",
    value: 128500000,
    change: "+15.2%",
    isPositive: true,
    type: "revenue",
    bgColor: "bg-amber-50 text-amber-600",
    textColor: "text-amber-600",
  },
  {
    title: "Active Providers",
    value: 187,
    change: "+5.4%",
    isPositive: true,
    type: "providers",
    bgColor: "bg-purple-50 text-purple-600",
    textColor: "text-purple-600",
  },
];

export function PlatformSummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {CARDS.map((card) => {
        const displayValue =
          card.type === "revenue"
            ? formatCurrency(card.value as number, "VND")
            : (card.value as number).toLocaleString("en-US");

        return (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm font-medium">
                {card.title}
              </span>
              <div
                className={cn(
                  "p-2.5 rounded-lg text-xs font-semibold",
                  card.bgColor,
                )}
              >
                {card.type === "users" && (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                )}
                {card.type === "bookings" && (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
                {card.type === "revenue" && (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {card.type === "providers" && (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                {displayValue}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold",
                  card.isPositive
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700",
                )}
              >
                <svg
                  className={cn(
                    "w-3.5 h-3.5",
                    card.isPositive ? "text-green-600" : "text-red-600",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      card.isPositive
                        ? "M5 10l7-7m0 0l7 7m-7-7v18"
                        : "M19 14l-7 7m0 0l-7-7m7 7V3"
                    }
                  />
                </svg>
                {card.change}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-normal">
              vs. previous month
            </p>
          </div>
        );
      })}
    </div>
  );
}
