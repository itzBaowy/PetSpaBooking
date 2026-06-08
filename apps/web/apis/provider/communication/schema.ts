import { z } from 'zod';

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
  recipientId: z.string(),
});

export const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['booking', 'reminder', 'review', 'general']),
});

export type MessageFormData = z.infer<typeof messageSchema>;
export type NotificationFormData = z.infer<typeof notificationSchema>;
