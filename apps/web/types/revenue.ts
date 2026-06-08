export interface Revenue {
  id: string;
  providerId: string;
  bookingId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'processed' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}
