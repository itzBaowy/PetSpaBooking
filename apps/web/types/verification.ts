export interface VerificationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface VerificationRequest {
  id: string;
  providerId: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  documents: VerificationDocument[];
  status: "pending" | "approved" | "rejected" | "info_requested";
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationStatus {
  id: string;
  providerId: string;
  status: "pending" | "approved" | "rejected" | "info_requested";
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}