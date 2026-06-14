import { z } from "zod";

export const marketingStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "SCHEDULED",
  "PAUSED",
  "EXPIRED",
]);

export const bannerSlotSchema = z.enum(["HOME_HERO", "SEARCH_TOP", "CHECKOUT"]);

export const campaignTypeSchema = z.enum([
  "BANNER",
  "COUPON",
  "FLASH_SALE",
]);

export const couponTypeSchema = z.enum(["PERCENTAGE", "FIXED_AMOUNT"]);

export const marketingCampaignSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  type: campaignTypeSchema,
  status: marketingStatusSchema,
  startsAt: z.string(),
  endsAt: z.string(),
  budgetVnd: z.number().nonnegative(),
  usageCount: z.number().int().nonnegative(),
  conversionRate: z.number().nonnegative(),
});

export const bannerConfigSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  slot: bannerSlotSchema,
  status: marketingStatusSchema,
  imageUrl: z.string().url(),
  targetUrl: z.string().min(1),
  priority: z.number().int().min(1),
});

export const couponConfigSchema = z.object({
  id: z.string(),
  code: z.string().min(3),
  type: couponTypeSchema,
  status: marketingStatusSchema,
  value: z.number().positive(),
  minOrderValue: z.number().nonnegative(),
  usageLimit: z.number().int().positive(),
  usedCount: z.number().int().nonnegative(),
});

export const campaignActionSchema = z.object({
  campaignId: z.string(),
  action: z.enum(["ACTIVATE", "PAUSE", "ARCHIVE"]),
});

export type MarketingStatus = z.infer<typeof marketingStatusSchema>;
export type CampaignType = z.infer<typeof campaignTypeSchema>;
export type BannerSlot = z.infer<typeof bannerSlotSchema>;
export type CouponType = z.infer<typeof couponTypeSchema>;
export type MarketingCampaign = z.infer<typeof marketingCampaignSchema>;
export type BannerConfig = z.infer<typeof bannerConfigSchema>;
export type CouponConfig = z.infer<typeof couponConfigSchema>;
export type CampaignActionData = z.infer<typeof campaignActionSchema>;
