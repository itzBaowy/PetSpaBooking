"use client";

import { formatCurrency } from "@/lib/currency";

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

export function TopServicesTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between h-[380px]">
      <div>
        <div className="p-6 pb-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Popular Services</h3>
          <span className="text-xs text-gray-400 font-normal">
            By Bookings Volume
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Service Name
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Bookings
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SERVICES.map((s) => {
                const badgeStyle =
                  CATEGORY_STYLES[s.category] ||
                  "bg-gray-50 text-gray-700 border-gray-100";

                return (
                  <tr
                    key={s.name}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-gray-800 text-sm">
                        {s.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeStyle}`}
                        >
                          {s.category}
                        </span>
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <svg
                            className="w-2.5 h-2.5 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
                          </svg>
                          {s.growth}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium text-gray-600 text-sm">
                      {s.bookings}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-gray-900 text-sm">
                      {formatCurrency(s.revenue, "VND")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
