"use client";

import { formatCurrency } from "@/lib/currency";
import { formatInitials } from "@/lib/utils";

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

export function TopProvidersTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between h-[380px]">
      <div>
        <div className="p-6 pb-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">
            Top Performing Providers
          </h3>
          <span className="text-xs text-gray-400 font-normal">
            By Monthly Revenue
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Provider
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
              {PROVIDERS.map((p, idx) => {
                const initials = formatInitials(p.firstName, p.lastName);
                const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                return (
                  <tr
                    key={p.shopName}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-3.5 flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${colorClass}`}
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">
                          {p.shopName}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <span>
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <svg
                              className="w-3 h-3 fill-amber-500"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-medium text-gray-600">
                              {p.rating}
                            </span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium text-gray-600 text-sm">
                      {p.bookings}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-gray-900 text-sm">
                      {formatCurrency(p.revenue, "VND")}
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
