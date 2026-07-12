export type TrustRiskLevel = "LOW" | "WATCH" | "RESTRICTED" | "SUSPENDED";

export interface ProviderBalance {
  availableBalance: number;
  reservedBalance: number;
  debtBalance: number;
  safetyBuffer: number;
  currency: "VND";
  lastUpdatedAt: string;
}

export interface ProviderTrustScore {
  score: number;
  riskLevel: TrustRiskLevel;
  completionRate: number;
  noShowRate: number;
  disputeRate: number;
  cashAbnormalityRate: number;
  lastCalculatedAt: string;
}

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
  verificationStatus: "pending" | "approved" | "rejected";
  balance?: ProviderBalance;
  trustScore?: ProviderTrustScore;
  createdAt: string;
  updatedAt: string;
}

export type ProviderVerificationStatus =
  | "not_submitted"
  | "pending"
  | "requires_changes"
  | "approved"
  | "rejected"
  | "suspended";

export type VerificationOcrStatus = "not_required" | "processing" | "matched" | "needs_review";
export type VerificationReviewStatus = "not_reviewed" | "in_review" | "approved" | "changes_required" | "rejected";

export interface ProviderVerificationDocument {
  id: string;
  filename: string;
  type: string;
  uploadedAt: string;
  ocrStatus: VerificationOcrStatus;
  reviewStatus: VerificationReviewStatus;
  previewKind: "image" | "document";
}

export interface ProviderVerificationFeedback {
  reason: string;
  fields: string[];
  documents: string[];
  adminNote: string;
  deadline?: string;
}

export interface ProviderVerificationTimelineItem {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  state: "complete" | "current" | "upcoming";
}

export interface ProviderVerificationProfile {
  applicationId: string;
  status: ProviderVerificationStatus;
  lastSubmittedAt?: string;
  business: {
    businessName: string;
    representativeName: string;
    phone: string;
    email: string;
    address: string;
    serviceCategories: string[];
    operatingModel: string;
  };
  documents: ProviderVerificationDocument[];
  feedback?: ProviderVerificationFeedback;
  timeline: ProviderVerificationTimelineItem[];
}

export type ProviderImageKind = "logo" | "cover" | "gallery";

export interface ProviderBusinessImage {
  id: string;
  kind: ProviderImageKind;
  name: string;
  url: string;
  isLocal?: boolean;
}

export interface ProviderBusinessHour {
  day: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

export interface ProviderBusinessProfileForm {
  businessName: string;
  shortDescription: string;
  fullDescription: string;
  serviceCategories: string[];
  operatingModel: string;
  yearsOfOperation: number;
  registrationNumber: string;
  representativeName: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  socialLink: string;
  province: string;
  district: string;
  ward: string;
  detailedAddress: string;
  latitude: string;
  longitude: string;
  supportedServices: string[];
  images: ProviderBusinessImage[];
  businessHours: ProviderBusinessHour[];
  verificationDocumentsComplete: boolean;
  payoutInformationComplete: boolean;
}

export type ProviderBusinessProfileErrors = Partial<Record<
  "businessName" | "contactEmail" | "contactPhone" | "detailedAddress" | "businessHours" | "images",
  string
>>;
