import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
};

export function useBookings() {
  return useQuery({
    queryKey: bookingKeys.lists(),
    queryFn: () => api.get('/bookings'),
  });
}

export function useUpdateBooking() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/bookings/${id}`, data),
  });
}
