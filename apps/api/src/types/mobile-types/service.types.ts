export type ServiceDetailResponse = {
  id: string;
  providerId: string;
  name: string;
  price: number;
  durationMinutes: number;
  thumbnailUrl: string;
  description?: string;
  providerName: string;
  targetPets: string[];
  benefits: string[];
  gallery: string[];
  longDescription: string;
};
