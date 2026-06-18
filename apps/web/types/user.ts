export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
}
