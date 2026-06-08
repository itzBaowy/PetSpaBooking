import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const analyticsKeys = {
  all: ['analytics'] as const,
  metrics: () => [...analyticsKeys.all, 'metrics'] as const,
  trends: () => [...analyticsKeys.all, 'trends'] as const,
};

export function useAnalyticsMetrics() {
  return useQuery({
    queryKey: analyticsKeys.metrics(),
    queryFn: () => api.get('/analytics/metrics'),
  });
}

export function useBookingTrends() {
  return useQuery({
    queryKey: analyticsKeys.trends(),
    queryFn: () => api.get('/analytics/trends'),
  });
}
