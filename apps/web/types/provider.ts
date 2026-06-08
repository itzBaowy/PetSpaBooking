export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
