// Mock data for verification - no external dependencies
// Replace with real API calls when backend is ready

export interface MockVerificationRequest {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  documentCount: number;
  status: "pending" | "approved" | "rejected" | "info_requested";
  createdAt: string;
}

export const MOCK_VERIFICATIONS: MockVerificationRequest[] = [
  {
    id: "v-001",
    businessName: "PetCare Spa & Clinic",
    email: "contact@petcare.com",
    phone: "+84 28 3456 7890",
    address: "456 Nguyen Hue Street, District 1, HCMC",
    description: "Full-service pet grooming and veterinary clinic with 8 years of experience. Specializing in dog and cat care.",
    documentCount: 5,
    status: "pending",
    createdAt: "2026-06-10T08:30:00Z",
  },
  {
    id: "v-002",
    businessName: "Happy Paws Grooming",
    email: "info@happypaws.com",
    phone: "+84 90 123 4567",
    address: "123 Le Loi Street, District 3, HCMC",
    description: "Professional pet grooming services including bathing, haircuts, and nail trimming.",
    documentCount: 3,
    status: "pending",
    createdAt: "2026-06-09T14:15:00Z",
  },
  {
    id: "v-003",
    businessName: "VetPro Animal Hospital",
    email: "hello@vetpro.vn",
    phone: "+84 28 3822 1234",
    address: "789 Hai Ba Trung, District 1, HCMC",
    description: "Advanced veterinary services with modern equipment. Vaccination, surgery, and dental care.",
    documentCount: 4,
    status: "approved",
    createdAt: "2026-06-05T10:00:00Z",
  },
  {
    id: "v-004",
    businessName: "Pet Hotel & Daycare",
    email: "book@pethotel.com",
    phone: "+84 91 888 5555",
    address: "321 Nguyen Thi Minh Khai, District 3, HCMC",
    description: "Luxury pet boarding and daycare facility with 24/7 supervision and webcam access.",
    documentCount: 2,
    status: "rejected",
    createdAt: "2026-06-03T09:45:00Z",
  },
  {
    id: "v-005",
    businessName: "Furry Friends Clinic",
    email: "care@furryfriends.vn",
    phone: "+84 28 3512 6789",
    address: "567 Vo Van Tan Street, District 5, HCMC",
    description: "Small animal veterinary clinic focused on preventive care and wellness programs.",
    documentCount: 4,
    status: "info_requested",
    createdAt: "2026-06-01T16:30:00Z",
  },
  {
    id: "v-006",
    businessName: "Paws & Claws Spa",
    email: "spa@pawsnclaws.com",
    phone: "+84 93 456 7890",
    address: "234 Pham Ngoc Thach, District 1, HCMC",
    description: "Premium pet spa services including hydrotherapy, aromatherapy, and massage.",
    documentCount: 3,
    status: "pending",
    createdAt: "2026-05-28T11:00:00Z",
  },
  {
    id: "v-007",
    businessName: "Animal Wellness Center",
    email: "info@animalwellness.vn",
    phone: "+84 28 3844 5678",
    address: "890 Xo Viet Nghe Tinh, Binh Thanh, HCMC",
    description: "Comprehensive animal healthcare with specialized departments for different pets.",
    documentCount: 5,
    status: "approved",
    createdAt: "2026-05-25T13:20:00Z",
  },
  {
    id: "v-008",
    businessName: "Doggie Paradise Resort",
    email: "stay@doggieparadise.com",
    phone: "+84 97 789 0123",
    address: "12 Nguyen Van Linh, District 7, HCMC",
    description: "Resort-style boarding for dogs with swimming pool, agility course, and luxury suites.",
    documentCount: 2,
    status: "pending",
    createdAt: "2026-05-20T08:00:00Z",
  },
];