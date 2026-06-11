import { z } from "zod";

export const disputeResolutionSchema = z.object({
  resolution: z.string().min(10),
  refundAmount: z.number().min(0),
  refundTo: z.enum(["customer", "provider"]),
});

export type DisputeResolutionData = z.infer<typeof disputeResolutionSchema>;
