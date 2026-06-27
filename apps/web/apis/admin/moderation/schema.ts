import { z } from "zod";

export const contentModerationActionSchema = z.object({
  contentId: z.string().min(1),
  action: z.enum(["APPROVE", "HIDE", "REQUEST_CHANGES"]),
  note: z.string().min(10),
});

export const reportResolutionSchema = z.object({
  reportId: z.string().min(1),
  action: z.enum(["DISMISS", "WARN_PROVIDER", "HIDE_SERVICE", "ESCALATE"]),
  reason: z.string().min(10),
});

export const reportCreateSchema = z.object({
  contentId: z.string(),
  contentType: z.enum(["SERVICE", "REVIEW", "PROVIDER", "CUSTOMER"]),
  reason: z.string().min(10),
});

export type ContentModerationActionData = z.infer<
  typeof contentModerationActionSchema
>;
export type ReportResolutionData = z.infer<typeof reportResolutionSchema>;
export type ReportCreateData = z.infer<typeof reportCreateSchema>;
