import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string(),
  price: z.number().positive('Price must be positive'),
  duration: z.number().positive('Duration must be positive'),
  category: z.string().min(1, 'Category is required'),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
