import { z } from "zod";

export const revenueSummarySchema = z.object({
  range: z.object({
    from: z.string().nullable(),
    to: z.string().nullable(),
  }),
  totalBookingAmount: z.number(),
  totalCommission: z.number(),
  totalProviderEarning: z.number(),
  completedBookings: z.number(),
  cashBookings: z.number(),
  onlineBookings: z.number(),
  withdrawalPaidAmount: z.number(),
});

export const dailyRevenuePointSchema = z.object({
  date: z.string(),
  bookingAmount: z.number(),
  commission: z.number(),
  providerEarning: z.number(),
  completedBookings: z.number(),
});

export const providerPerformanceSchema = z.object({
  providerId: z.string(),
  businessName: z.string(),
  providerStatus: z.string(),
  depositStatus: z.string(),
  walletBalance: z.number(),
  completedBookings: z.number(),
  totalRevenue: z.number(),
  commission: z.number(),
  averageRating: z.number(),
  totalReviews: z.number(),
  disputes: z.number(),
});

export const providerPerformanceListSchema = z.object({
  items: z.array(providerPerformanceSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
  }),
});

export type RevenueSummary = z.infer<typeof revenueSummarySchema>;
export type DailyRevenuePoint = z.infer<typeof dailyRevenuePointSchema>;
export type ProviderPerformance = z.infer<typeof providerPerformanceSchema>;
