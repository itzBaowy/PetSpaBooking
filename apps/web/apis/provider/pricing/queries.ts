import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const pricingKeys = {
  all: ['pricing'] as const,
  list: () => [...pricingKeys.all, 'list'] as const,
};

export function usePricing() {
  return useQuery({
    queryKey: pricingKeys.list(),
    queryFn: () => api.get('/pricing'),
  });
}

export function useCreatePromotion() {
  return useMutation({
    mutationFn: (data: any) => api.post('/promotions', data),
  });
}
