import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiEnvelope, ProviderBookingApi, ProviderPage } from "@/types/provider-api";

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export type ProviderBookedCustomer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  totalBookings: number;
  lastBookingAt?: string | null;
  pets: Array<{ name?: string | null; species?: string | null; breed?: string | null }>;
  bookings: ProviderBookingApi[];
};

export const customerKeys = {
  all: ["provider", "customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  detail: (id: string) => [...customerKeys.all, "detail", id] as const,
};

export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: async () => {
      const page = unwrap<ProviderPage<ProviderBookingApi>>(
        await api.get(API_ENDPOINTS.MOBILE.PROVIDER.BOOKINGS, {
          params: { page: 1, pageSize: 200 },
        }),
      );
      return buildCustomersFromBookings(page.items);
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const customers = buildCustomersFromBookings(
        unwrap<ProviderPage<ProviderBookingApi>>(
          await api.get(API_ENDPOINTS.MOBILE.PROVIDER.BOOKINGS, {
            params: { page: 1, pageSize: 200 },
          }),
        ).items,
      );
      const customer = customers.find((item) => item.id === id);
      if (!customer) throw new Error("Không tìm thấy khách hàng trong lịch đặt của provider.");
      return customer;
    },
    enabled: Boolean(id),
  });
}

function buildCustomersFromBookings(bookings: ProviderBookingApi[]) {
  const grouped = new Map<string, ProviderBookedCustomer>();

  for (const booking of bookings) {
    const customerId = booking.customer?.id ?? booking.customer?.users?.email ?? "unknown";
    const current =
      grouped.get(customerId) ??
      {
        id: customerId,
        name: booking.customer?.users?.fullName ?? "Khách hàng",
        email: booking.customer?.users?.email,
        phone: booking.customer?.users?.phone,
        totalBookings: 0,
        lastBookingAt: null,
        pets: [],
        bookings: [],
      };

    current.totalBookings += 1;
    current.bookings.push(booking);
    if (!current.lastBookingAt || booking.appointmentStart > current.lastBookingAt) {
      current.lastBookingAt = booking.appointmentStart;
    }
    if (booking.pet?.name && !current.pets.some((pet) => pet.name === booking.pet?.name)) {
      current.pets.push(booking.pet);
    }
    grouped.set(customerId, current);
  }

  return Array.from(grouped.values()).sort((a, b) =>
    String(b.lastBookingAt ?? "").localeCompare(String(a.lastBookingAt ?? "")),
  );
}
