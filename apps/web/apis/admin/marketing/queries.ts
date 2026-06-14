import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { campaignActionSchema } from "./schema";
import type {
  BannerConfig,
  CampaignActionData,
  CouponConfig,
  MarketingCampaign,
} from "./schema";

export const marketingKeys = {
  all: ["admin", "marketing"] as const,
  campaigns: () => [...marketingKeys.all, "campaigns"] as const,
  banners: () => [...marketingKeys.all, "banners"] as const,
  coupons: () => [...marketingKeys.all, "coupons"] as const,
};

export const marketingCampaignMockItems: MarketingCampaign[] = [
  {
    id: "MKT-2406",
    name: "Summer Pet Care Boost",
    type: "BANNER",
    status: "ACTIVE",
    startsAt: "2026-06-01",
    endsAt: "2026-06-30",
    budgetVnd: 18000000,
    usageCount: 12480,
    conversionRate: 4.8,
  },
  {
    id: "MKT-2407",
    name: "Weekend Grooming Flash",
    type: "FLASH_SALE",
    status: "SCHEDULED",
    startsAt: "2026-06-21",
    endsAt: "2026-06-23",
    budgetVnd: 9200000,
    usageCount: 0,
    conversionRate: 0,
  },
  {
    id: "MKT-2402",
    name: "New Owner Welcome",
    type: "COUPON",
    status: "ACTIVE",
    startsAt: "2026-05-01",
    endsAt: "2026-08-01",
    budgetVnd: 12500000,
    usageCount: 896,
    conversionRate: 9.6,
  },
  {
    id: "MKT-2398",
    name: "Provider Reactivation",
    type: "COUPON",
    status: "PAUSED",
    startsAt: "2026-04-01",
    endsAt: "2026-06-20",
    budgetVnd: 6200000,
    usageCount: 238,
    conversionRate: 2.1,
  },
];

export const bannerMockItems: BannerConfig[] = [
  {
    id: "BAN-01",
    title: "Summer Vaccination Blitz",
    slot: "HOME_HERO",
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d",
    targetUrl: "/services?campaign=summer-vaccine",
    priority: 1,
  },
  {
    id: "BAN-02",
    title: "Luxury Grooming Packages",
    slot: "SEARCH_TOP",
    status: "SCHEDULED",
    imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a",
    targetUrl: "/services?category=grooming",
    priority: 2,
  },
  {
    id: "BAN-03",
    title: "First Booking Coupon",
    slot: "CHECKOUT",
    status: "DRAFT",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
    targetUrl: "/checkout?coupon=PETWELCOME",
    priority: 3,
  },
];

export const couponMockItems: CouponConfig[] = [
  {
    id: "CPN-01",
    code: "PETWELCOME",
    type: "PERCENTAGE",
    status: "ACTIVE",
    value: 15,
    minOrderValue: 150000,
    usageLimit: 3000,
    usedCount: 896,
  },
  {
    id: "CPN-02",
    code: "FLASH50K",
    type: "FIXED_AMOUNT",
    status: "SCHEDULED",
    value: 50000,
    minOrderValue: 250000,
    usageLimit: 800,
    usedCount: 0,
  },
  {
    id: "CPN-03",
    code: "LOYALPET",
    type: "PERCENTAGE",
    status: "PAUSED",
    value: 10,
    minOrderValue: 300000,
    usageLimit: 1200,
    usedCount: 412,
  },
];

export function useMarketingCampaigns() {
  return useQuery<MarketingCampaign[]>({
    queryKey: marketingKeys.campaigns(),
    queryFn: async () => {
      const response = await api.get<MarketingCampaign[]>(
        "/admin/marketing/campaigns",
      );
      return response.data;
    },
    initialData: marketingCampaignMockItems,
    enabled: false,
  });
}

export function useMarketingBanners() {
  return useQuery<BannerConfig[]>({
    queryKey: marketingKeys.banners(),
    queryFn: async () => {
      const response = await api.get<BannerConfig[]>("/admin/marketing/banners");
      return response.data;
    },
    initialData: bannerMockItems,
    enabled: false,
  });
}

export function useMarketingCoupons() {
  return useQuery<CouponConfig[]>({
    queryKey: marketingKeys.coupons(),
    queryFn: async () => {
      const response = await api.get<CouponConfig[]>("/admin/marketing/coupons");
      return response.data;
    },
    initialData: couponMockItems,
    enabled: false,
  });
}

export function useCampaignAction() {
  return useMutation({
    mutationFn: async (payload: CampaignActionData) => {
      const parsedPayload = campaignActionSchema.parse(payload);
      const response = await api.post<{ success: boolean }>(
        "/admin/marketing/campaigns/action",
        parsedPayload,
      );
      return response.data;
    },
  });
}
