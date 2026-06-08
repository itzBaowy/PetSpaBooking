import { z } from 'zod';

export const reportResolutionSchema = z.object({
  action: z.enum(['dismiss', 'warning', 'suspend', 'ban']),
  reason: z.string(),
});

export const reportCreateSchema = z.object({
  contentId: z.string(),
  contentType: z.enum(['service', 'review', 'provider', 'user']),
  reason: z.string().min(10),
});

export type ReportResolutionData = z.infer<typeof reportResolutionSchema>;
export type ReportCreateData = z.infer<typeof reportCreateSchema>;
