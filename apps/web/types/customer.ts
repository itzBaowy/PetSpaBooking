export interface Customer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}
