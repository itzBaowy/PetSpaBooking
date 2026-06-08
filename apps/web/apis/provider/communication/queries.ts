import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const communicationKeys = {
  all: ['communication'] as const,
  messages: () => [...communicationKeys.all, 'messages'] as const,
  notifications: () => [...communicationKeys.all, 'notifications'] as const,
};

export function useMessages() {
  return useQuery({
    queryKey: communicationKeys.messages(),
    queryFn: () => api.get('/messages'),
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: (data: any) => api.post('/messages', data),
  });
}
