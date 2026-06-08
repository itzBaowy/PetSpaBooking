export interface Service {
  id: string;
  providerId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number; // in minutes
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
