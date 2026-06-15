import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { accountStatusActionSchema } from "./schema";
import type {
  AccountStatusActionData,
  AdminAccountRole,
  AdminAccountStatus,
  ProviderType,
  ProviderVerificationStatus,
} from "./schema";

export interface AdminUserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminAccountRole;
  status: AdminAccountStatus;
  joinedAt: string;
  bookings: number;
  totalSpendVnd: number;
  banReason?: string;
  banExpiresAt?: string;
}

export interface AdminProviderAccount {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  providerType: ProviderType;
  verificationStatus: ProviderVerificationStatus;
  status: AdminAccountStatus;
  joinedAt: string;
  servicesCount: number;
  bookingsCount: number;
  rating: number;
  revenueVnd: number;
  banReason?: string;
  banExpiresAt?: string;
}

export const MOCK_ADMIN_USERS: AdminUserAccount[] = [
  {
    id: "USR-1001",
    name: "Minh Nguyen",
    email: "minh.nguyen@example.com",
    phone: "+84 90 111 2233",
    role: "PET_OWNER",
    status: "ACTIVE",
    joinedAt: "2026-01-12",
    bookings: 12,
    totalSpendVnd: 8200000,
  },
  {
    id: "USR-1002",
    name: "Lan Pham",
    email: "lan.pham@example.com",
    phone: "+84 91 222 3344",
    role: "PET_OWNER",
    status: "ACTIVE",
    joinedAt: "2026-02-05",
    bookings: 8,
    totalSpendVnd: 5100000,
  },
  {
    id: "USR-1003",
    name: "An Tran",
    email: "an.tran@example.com",
    phone: "+84 93 333 4455",
    role: "PET_OWNER",
    status: "SUSPENDED",
    joinedAt: "2026-03-18",
    bookings: 3,
    totalSpendVnd: 1400000,
    banReason: "Repeated no-show reports",
    banExpiresAt: "2026-06-30",
  },
  {
    id: "USR-1004",
    name: "Happy Paws Spa",
    email: "owner@happypaws.vn",
    phone: "+84 28 3456 7890",
    role: "SERVICE_PROVIDER",
    status: "ACTIVE",
    joinedAt: "2025-12-20",
    bookings: 342,
    totalSpendVnd: 38400000,
  },
  {
    id: "USR-1005",
    name: "VetCare 24h",
    email: "admin@vetcare24h.vn",
    phone: "+84 28 3822 1234",
    role: "SERVICE_PROVIDER",
    status: "ACTIVE",
    joinedAt: "2026-01-04",
    bookings: 218,
    totalSpendVnd: 27600000,
  },
  {
    id: "USR-1006",
    name: "Super Admin",
    email: "admin@petlink.vn",
    phone: "+84 28 0000 0001",
    role: "ADMIN",
    status: "ACTIVE",
    joinedAt: "2025-10-01",
    bookings: 0,
    totalSpendVnd: 0,
  },
  {
    id: "USR-1007",
    name: "Bao Le",
    email: "bao.le@example.com",
    phone: "+84 97 555 6677",
    role: "PET_OWNER",
    status: "ACTIVE",
    joinedAt: "2026-04-02",
    bookings: 5,
    totalSpendVnd: 2800000,
  },
  {
    id: "USR-1008",
    name: "Paws & Claws Spa",
    email: "spa@pawsnclaws.com",
    phone: "+84 93 456 7890",
    role: "SERVICE_PROVIDER",
    status: "SUSPENDED",
    joinedAt: "2026-02-26",
    bookings: 94,
    totalSpendVnd: 12300000,
    banReason: "Unresolved service quality reports",
  },
];

export const MOCK_ADMIN_PROVIDERS: AdminProviderAccount[] = [
  {
    id: "PRV-2001",
    businessName: "Happy Paws Spa",
    ownerName: "Anh Nguyen",
    email: "owner@happypaws.vn",
    phone: "+84 28 3456 7890",
    providerType: "SPA",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    joinedAt: "2025-12-20",
    servicesCount: 12,
    bookingsCount: 342,
    rating: 4.9,
    revenueVnd: 38400000,
  },
  {
    id: "PRV-2002",
    businessName: "VetCare 24h",
    ownerName: "Huy Tran",
    email: "admin@vetcare24h.vn",
    phone: "+84 28 3822 1234",
    providerType: "CLINIC",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    joinedAt: "2026-01-04",
    servicesCount: 9,
    bookingsCount: 218,
    rating: 4.7,
    revenueVnd: 27600000,
  },
  {
    id: "PRV-2003",
    businessName: "Paws & Claws Spa",
    ownerName: "Mai Do",
    email: "spa@pawsnclaws.com",
    phone: "+84 93 456 7890",
    providerType: "GROOMING",
    verificationStatus: "PENDING",
    status: "SUSPENDED",
    joinedAt: "2026-02-26",
    servicesCount: 7,
    bookingsCount: 94,
    rating: 4.2,
    revenueVnd: 12300000,
    banReason: "Unresolved service quality reports",
  },
  {
    id: "PRV-2004",
    businessName: "Pet Hotel & Daycare",
    ownerName: "Quynh Pham",
    email: "book@pethotel.com",
    phone: "+84 91 888 5555",
    providerType: "PET_HOTEL",
    verificationStatus: "REJECTED",
    status: "ACTIVE",
    joinedAt: "2026-03-03",
    servicesCount: 5,
    bookingsCount: 71,
    rating: 4.1,
    revenueVnd: 9800000,
  },
  {
    id: "PRV-2005",
    businessName: "Animal Wellness Center",
    ownerName: "Linh Vo",
    email: "info@animalwellness.vn",
    phone: "+84 28 3844 5678",
    providerType: "CLINIC",
    verificationStatus: "VERIFIED",
    status: "ACTIVE",
    joinedAt: "2026-04-15",
    servicesCount: 11,
    bookingsCount: 126,
    rating: 4.8,
    revenueVnd: 18100000,
  },
  {
    id: "PRV-2006",
    businessName: "Furry Friends Clinic",
    ownerName: "Nhi Huynh",
    email: "care@furryfriends.vn",
    phone: "+84 28 3512 6789",
    providerType: "CLINIC",
    verificationStatus: "PENDING",
    status: "ACTIVE",
    joinedAt: "2026-05-09",
    servicesCount: 4,
    bookingsCount: 38,
    rating: 4.5,
    revenueVnd: 5200000,
  },
];

export const adminUserKeys = {
  all: ["admin", "users"] as const,
  lists: () => [...adminUserKeys.all, "list"] as const,
  providers: () => [...adminUserKeys.all, "providers"] as const,
  detail: (id: string) => [...adminUserKeys.all, "detail", id] as const,
};

export function useAdminUsers() {
  return useQuery<AdminUserAccount[]>({
    queryKey: adminUserKeys.lists(),
    queryFn: async () => {
      const response = await api.get<AdminUserAccount[]>("/admin/users");
      return response.data;
    },
    initialData: MOCK_ADMIN_USERS,
    enabled: false,
  });
}

export function useAdminProviders() {
  return useQuery<AdminProviderAccount[]>({
    queryKey: adminUserKeys.providers(),
    queryFn: async () => {
      const response =
        await api.get<AdminProviderAccount[]>("/admin/providers");
      return response.data;
    },
    initialData: MOCK_ADMIN_PROVIDERS,
    enabled: false,
  });
}

export function useUpdateUserStatus() {
  return useMutation({
    mutationFn: async (payload: AccountStatusActionData) => {
      const parsedPayload = accountStatusActionSchema.parse(payload);
      const response = await api.patch<{ success: boolean }>(
        `/admin/accounts/${parsedPayload.accountId}/status`,
        parsedPayload,
      );
      return response.data;
    },
  });
}
