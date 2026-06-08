import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  detail: (id: string) => [...serviceKeys.all, 'detail', id] as const,
};

export function useServices() {
  return useQuery({
    queryKey: serviceKeys.lists(),
    queryFn: () => api.get('/services'),
  });
}

export function useCreateService() {
  return useMutation({
    mutationFn: (data: any) => api.post('/services', data),
  });
}
