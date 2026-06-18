import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const adminBookingKeys = {
  all: ["admin", "bookings"] as const,
  lists: () => [...adminBookingKeys.all, "list"] as const,
  disputes: () => [...adminBookingKeys.all, "disputes"] as const,
};

export function useAdminBookings() {
  return useQuery({
    queryKey: adminBookingKeys.lists(),
    queryFn: () => api.get("/admin/bookings"),
  });
}

export function useDisputeBookings() {
  return useQuery({
    queryKey: adminBookingKeys.disputes(),
    queryFn: () => api.get("/admin/bookings/disputes"),
  });
}
