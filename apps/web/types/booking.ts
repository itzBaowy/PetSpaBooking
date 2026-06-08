export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  scheduledAt: string;
  duration: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
