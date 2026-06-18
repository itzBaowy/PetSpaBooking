export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "provider" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  token: AuthToken;
}
