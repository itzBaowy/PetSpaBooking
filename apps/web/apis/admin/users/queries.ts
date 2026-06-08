import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  detail: (id: string) => [...adminUserKeys.all, 'detail', id] as const,
};

export function useAdminUsers() {
  return useQuery({
    queryKey: adminUserKeys.lists(),
    queryFn: () => api.get('/admin/users'),
  });
}

export function useUpdateUserStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/users/${id}/status`, { status }),
  });
}
