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

export type ProviderServiceStatus = "draft" | "pending_review" | "active" | "rejected" | "hidden" | "suspended";
export type MockProviderStatus = "pending" | "approved";

export interface ProviderServiceMock {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  detailedDescription: string;
  basePrice: number;
  duration: number;
  petTypes: string[];
  petSizes: string[];
  deliveryType: string;
  images: Array<{ id: string; name: string; url: string; isLocal?: boolean }>;
  preparationInstructions: string;
  cancellationPolicy: string;
  visibility: "public" | "private";
  bookingCount: number;
  futureBookingCount: number;
  rating: number;
  status: ProviderServiceStatus;
  updatedAt: string;
  rejectionReason?: string;
}

export type ProviderServiceFormData = Omit<ProviderServiceMock, "id" | "bookingCount" | "futureBookingCount" | "rating" | "status" | "updatedAt" | "rejectionReason">;
export type ProviderServiceFormErrors = Partial<Record<"name" | "category" | "basePrice" | "duration" | "petTypes" | "images", string>>;
