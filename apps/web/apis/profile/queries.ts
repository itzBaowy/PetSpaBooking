import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { profileUpdateSchema } from "./schema";
import type { Profile, ProfileRouteRole, ProfileUpdateData } from "./schema";

const MOCK_PROFILES: Record<ProfileRouteRole, Profile> = {
  admin: {
    id: "ADM-0001",
    name: "Super Admin",
    email: "admin@petlink.vn",
    phone: "+84 28 0000 0001",
    role: "ADMIN",
    title: "Platform Operations Lead",
    department: "Trust & Safety",
    timezone: "Asia/Bangkok",
    lastLoginAt: "2026-06-15T08:30:00.000Z",
    joinedAt: "2025-10-01T00:00:00.000Z",
  },
  provider: {
    id: "PRV-2001",
    name: "Anh Nguyen",
    email: "owner@happypaws.vn",
    phone: "+84 28 3456 7890",
    role: "SERVICE_PROVIDER",
    title: "Business Owner",
    department: "Happy Paws Spa",
    timezone: "Asia/Bangkok",
    lastLoginAt: "2026-06-15T07:45:00.000Z",
    joinedAt: "2025-12-20T00:00:00.000Z",
  },
};

export const profileKeys = {
  all: ["profile"] as const,
  detail: (role: ProfileRouteRole) => [...profileKeys.all, role] as const,
};

export function useProfile(role: ProfileRouteRole) {
  return useQuery<Profile>({
    queryKey: profileKeys.detail(role),
    queryFn: async () => {
      const response = await api.get<Profile>(`/${role}/profile`);
      return response.data;
    },
    initialData: MOCK_PROFILES[role],
    enabled: false,
  });
}

export function useUpdateProfile(role: ProfileRouteRole) {
  return useMutation({
    mutationFn: async (payload: ProfileUpdateData) => {
      const parsedPayload = profileUpdateSchema.parse(payload);
      const response = await api.patch<Profile>(
        `/${role}/profile`,
        parsedPayload,
      );
      return response.data;
    },
  });
}
