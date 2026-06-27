import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse } from "@/types/api";
import { profileSchema } from "./schema";
import type { Profile } from "./schema";

export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
};

export function useProfile() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery<Profile>({
    queryKey: profileKeys.me(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Profile>>(
        API_ENDPOINTS.AUTH.PROFILE,
      );
      return profileSchema.parse(response.data.data);
    },
    enabled: Boolean(accessToken),
  });
}
