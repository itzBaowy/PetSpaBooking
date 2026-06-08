import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const businessProfileKeys = {
  all: ['businessProfile'] as const,
  detail: () => [...businessProfileKeys.all, 'detail'] as const,
};

export function useBusinessProfile() {
  return useQuery({
    queryKey: businessProfileKeys.detail(),
    queryFn: () => api.get('/business-profile'),
  });
}

export function useUpdateBusinessProfile() {
  return useMutation({
    mutationFn: (data: any) => api.put('/business-profile', data),
  });
}
