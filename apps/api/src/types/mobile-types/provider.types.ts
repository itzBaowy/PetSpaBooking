export type ProviderFilterPayload = {
  page?: number;
  pageSize?: number;
  search?: string;
  searchKey?: string;
  category?: string;
  minRating?: number;
  maxRating?: number;
  minPrice?: number;
  maxPrice?: number;
  isOpenNow?: boolean;
  userLat?: number;
  userLng?: number;
  maxDistanceKm?: number;
};

export type GlobalSearchServiceItem = {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
  price: number;
  durationMinutes: number;
  thumbnailUrl: string;
  description?: string;
  category: string;
  targetPets: string[];
  benefits: string[];
  createdAt: string;
};

export type GlobalSearchResponse = {
  providers: { id: string; name: string }[];
  services: { id: string; name: string }[];
};

export type ProviderItem = {
  id: string;
  slug: string;

  businessName: string;
  description: string;
  avatarUrl: string;
  coverImageUrl: string;

  isVerified: boolean;
  status: string;

  location: {
    address: string;
    ward: string;
    district: string;
    province: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    distanceKm: number;
  };

  rating: {
    average: number;
    totalReviews: number;
  };

  services: {
    total: number;
    categories: string[];
    priceRange: {
      min: number;
      max: number;
      currency: string;
    };
    preview: {
      id: string;
      name: string;
      price: number;
      durationMinutes: number;
      thumbnailUrl: string;
      description?: string;
    }[];
  };

  availability: {
    isOpenNow: boolean;
    canBookFuture: boolean;
    todayOpeningHours: {
      open: string;
      close: string;
    };
  };

  paymentMethods: {
    online: boolean;
    cash: boolean;
  };

  createdAt: string;
};
