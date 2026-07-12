import type { ProviderBusinessProfileForm } from "@/types/provider";

export const supportedServiceOptions = [
  "Grooming",
  "Spa",
  "Basic veterinary care",
  "Vaccination",
  "Boarding",
  "Pet sitting",
  "Training",
];

export const serviceCategoryOptions = ["Dog care", "Cat care", "Small pets", "Wellness", "Day care"];

export const providerBusinessProfileMock: ProviderBusinessProfileForm = {
  businessName: "Paws & Relax Pet Spa",
  shortDescription: "Gentle grooming and wellness care for pets in central Da Nang.",
  fullDescription: "Paws & Relax is a neighborhood pet care studio focused on calm handling, transparent service, and clean facilities. Our trained team offers grooming, spa care, and supervised day services for dogs and cats.",
  serviceCategories: ["Dog care", "Cat care", "Wellness"],
  operatingModel: "Single-location pet care studio",
  yearsOfOperation: 6,
  registrationNumber: "0402187654",
  representativeName: "Nguyen Minh Anh",
  contactPhone: "+84 912 345 678",
  contactEmail: "hello@pawsrelax.vn",
  website: "https://pawsrelax.vn",
  socialLink: "https://facebook.com/pawsrelaxdanang",
  province: "Da Nang",
  district: "Hai Chau",
  ward: "Hoa Cuong Bac",
  detailedAddress: "128 Nguyen Van Linh Street",
  latitude: "16.0471",
  longitude: "108.2068",
  supportedServices: ["Grooming", "Spa", "Pet sitting"],
  images: [
    { id: "image-logo", kind: "logo", name: "paws-relax-logo.jpg", url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80" },
    { id: "image-cover", kind: "cover", name: "studio-cover.jpg", url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1400&q=80" },
    { id: "gallery-1", kind: "gallery", name: "grooming-room.jpg", url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80" },
    { id: "gallery-2", kind: "gallery", name: "happy-client.jpg", url: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=800&q=80" },
    { id: "gallery-3", kind: "gallery", name: "spa-session.jpg", url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80" },
  ],
  businessHours: [
    { day: "Monday", isOpen: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Tuesday", isOpen: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Wednesday", isOpen: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Thursday", isOpen: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Friday", isOpen: true, openingTime: "08:00", closingTime: "19:00" },
    { day: "Saturday", isOpen: true, openingTime: "09:00", closingTime: "17:00" },
    { day: "Sunday", isOpen: false, openingTime: "09:00", closingTime: "17:00" },
  ],
  verificationDocumentsComplete: true,
  payoutInformationComplete: false,
};
