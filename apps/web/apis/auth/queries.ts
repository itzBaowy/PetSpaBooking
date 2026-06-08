import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const authKeys = {
  all: ['auth'] as const,
  login: () => [...authKeys.all, 'login'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.post('/auth/login', credentials),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => api.get('/auth/profile'),
  });
}
