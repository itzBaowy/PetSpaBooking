import { z } from "zod";

export const verificationApprovalSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
});

export const verificationRequestSchema = z.object({
  documents: z.array(z.string()),
  message: z.string().optional(),
});

export type VerificationApprovalData = z.infer<
  typeof verificationApprovalSchema
>;
export type VerificationRequestData = z.infer<typeof verificationRequestSchema>;
