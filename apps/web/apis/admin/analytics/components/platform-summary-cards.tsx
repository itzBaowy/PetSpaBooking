"use client";

import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { formatCurrency } from "@/lib/currency";

interface CardData {
  title: string;
  value: string | number;
  change: string;
  type: "users" | "bookings" | "revenue" | "providers";
  tone: "blue" | "green" | "amber" | "purple";
}

const CARDS: CardData[] = [
  {
    title: "Total Users",
    value: 4821,
    change: "+12.5%",
    type: "users",
    tone: "blue",
  },
  {
    title: "Total Bookings",
    value: 1340,
    change: "+8.3%",
    type: "bookings",
    tone: "green",
  },
  {
    title: "Platform Revenue",
    value: 128500000,
    change: "+15.2%",
    type: "revenue",
    tone: "amber",
  },
  {
    title: "Active Providers",
    value: 187,
    change: "+5.4%",
    type: "providers",
    tone: "purple",
  },
];

export function PlatformSummaryCards() {
  return (
    <StatisticCardGrid columns={4} className="gap-6">
      {CARDS.map((card) => {
        const displayValue =
          card.type === "revenue"
            ? formatCurrency(card.value as number, "VND")
            : (card.value as number).toLocaleString("en-US");

        return (
          <StatisticCard
            key={card.title}
            title={card.title}
            value={displayValue}
            tone={card.tone}
            change={card.change}
            changeDirection="up"
            footer="vs. previous month"
            icon={
              <>
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
              </>
            }
          />
        );
      })}
    </StatisticCardGrid>
  );
}
