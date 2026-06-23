import { z } from "zod";

export const businessProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;
