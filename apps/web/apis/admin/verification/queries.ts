import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const verificationKeys = {
  all: ['verification'] as const,
  lists: () => [...verificationKeys.all, 'list'] as const,
  detail: (id: string) => [...verificationKeys.all, 'detail', id] as const,
};

export function useVerifications() {
  return useQuery({
    queryKey: verificationKeys.lists(),
    queryFn: () => api.get('/verification'),
  });
}

export function useVerifyProvider() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      api.post(`/verification/${id}`, { status }),
  });
}
