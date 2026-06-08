import { z } from 'zod';

export const bookingStatusUpdateSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

export const bookingRescheduleSchema = z.object({
  scheduledAt: z.string(),
  duration: z.number().positive(),
});

export type BookingStatusUpdateData = z.infer<typeof bookingStatusUpdateSchema>;
export type BookingRescheduleData = z.infer<typeof bookingRescheduleSchema>;
