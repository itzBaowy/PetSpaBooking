import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const moderationKeys = {
  all: ["moderation"] as const,
  reports: () => [...moderationKeys.all, "reports"] as const,
  disputes: () => [...moderationKeys.all, "disputes"] as const,
};

export function useReports() {
  return useQuery({
    queryKey: moderationKeys.reports(),
    queryFn: () => api.get("/moderation/reports"),
  });
}

export function useResolveReport() {
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.post(`/moderation/reports/${id}/resolve`, { action }),
  });
}
