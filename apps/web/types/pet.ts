export interface Pet {
  id: string;
  customerId: string;
  name: string;
  breed: string;
  age: number;
  weight?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
