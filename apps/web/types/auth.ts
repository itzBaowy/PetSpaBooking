export type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN";

export type ProviderStatus =
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED";

export interface User {
  id: string;
  userName: string;
  email: string;
  phone: string;
  fullName: string | null;
  avatar: string | null;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE" | "BANNED" | string;
  providerProfileId: string | null;
  providerStatus: ProviderStatus | null;
  providerVerificationStatus: ProviderStatus | null;
  createAt: string;
  updateAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export type RegisterResponse = LoginResponse;

export interface LoginPayload {
  userName: string;
  password: string;
}

export interface RegisterPayload {
  userName: string;
  password: string;
  email: string;
  phone: string;
}
