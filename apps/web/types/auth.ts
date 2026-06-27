export interface User {
  id: string;
  userName: string;
  email: string;
  phone: string;
  fullName: string | null;
  avatar: string | null;
  role: "CUSTOMER" | "PENDING_PROVIDER" | "PROVIDER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BANNED" | string;
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
