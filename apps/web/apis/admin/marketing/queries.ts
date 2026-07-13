import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
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

type DefinedQuery<T> = UseQueryResult<T, unknown> & { data: T };

function withDefault<T>(query: UseQueryResult<T, unknown>, fallback: T): DefinedQuery<T> {
  return { ...query, data: query.data ?? fallback } as DefinedQuery<T>;
}

function unsupported(): never {
  throw new Error("Backend has no marketing management API yet.");
}

export function useMarketingCampaigns() {
  const query = useQuery<MarketingCampaign[]>({
    queryKey: marketingKeys.campaigns(),
    queryFn: async (): Promise<MarketingCampaign[]> => unsupported(),
    retry: false,
  });
  return withDefault(query, []);
}

export function useMarketingBanners() {
  const query = useQuery<BannerConfig[]>({
    queryKey: marketingKeys.banners(),
    queryFn: async (): Promise<BannerConfig[]> => unsupported(),
    retry: false,
  });
  return withDefault(query, []);
}

export function useMarketingCoupons() {
  const query = useQuery<CouponConfig[]>({
    queryKey: marketingKeys.coupons(),
    queryFn: async (): Promise<CouponConfig[]> => unsupported(),
    retry: false,
  });
  return withDefault(query, []);
}

export function useCampaignAction() {
  return useMutation({
    mutationFn: async (payload: CampaignActionData) => {
      campaignActionSchema.parse(payload);
      unsupported();
    },
  });
}
