import { z } from 'zod';

export const promotionSchema = z.object({
  name: z.string().min(1, 'Promotion name is required'),
  discountPercentage: z.number().min(0).max(100),
  validUntil: z.string(),
});

export const comboSchema = z.object({
  name: z.string().min(1, 'Combo name is required'),
  services: z.array(z.string()).min(1, 'At least one service is required'),
  price: z.number().positive('Price must be positive'),
});

export type PromotionFormData = z.infer<typeof promotionSchema>;
export type ComboFormData = z.infer<typeof comboSchema>;
