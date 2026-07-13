import type { ProviderServiceMock } from "@/types/service";

export const providerServiceCategories = ["Grooming", "Spa", "Veterinary", "Boarding", "Training"];
export const providerServiceStatuses = ["draft", "pending_review", "active", "rejected", "hidden", "suspended"] as const;

const names = [
  ["Full Grooming Package", "Grooming"], ["Gentle Bath & Blow Dry", "Grooming"], ["Herbal Coat Spa", "Spa"],
  ["Basic Wellness Check", "Veterinary"], ["Puppy Day Boarding", "Boarding"], ["Positive Puppy Training", "Training"],
  ["Cat De-shedding Care", "Grooming"], ["Sensitive Skin Spa", "Spa"], ["Senior Pet Check-up", "Veterinary"],
  ["Weekend Pet Boarding", "Boarding"], ["Basic Obedience Class", "Training"], ["Nail & Paw Care", "Grooming"],
] as const;

export const providerServicesMock: ProviderServiceMock[] = names.map(([name, category], index) => {
  const statuses = providerServiceStatuses;
  return {
    id: `service-${index + 1}`,
    name,
    category,
    shortDescription: `Professional ${name.toLowerCase()} delivered with calm handling and pet-safe products.`,
    detailedDescription: `A structured PetLink service designed around pet comfort, hygiene, and transparent communication with owners. The provider confirms the pet's condition before starting and shares after-care guidance at handover.`,
    basePrice: 180000 + index * 45000,
    duration: 30 + (index % 4) * 30,
    petTypes: index % 3 === 0 ? ["Dog", "Cat"] : ["Dog"],
    petSizes: ["Small", "Medium", ...(index % 2 ? ["Large"] : [])],
    deliveryType: index % 3 === 0 ? "At provider facility" : "At provider facility",
    images: [{ id: `service-image-${index}`, name: `${name.toLowerCase().replaceAll(" ", "-")}.jpg`, url: `https://images.unsplash.com/photo-${index % 2 ? "1583337130417-3346a1be7dee" : "1516734212186-a967f81ad0d7"}?auto=format&fit=crop&w=800&q=80` }],
    preparationInstructions: "Please share allergy information and keep the pet's vaccination record available.",
    cancellationPolicy: "Free cancellation up to 24 hours before the appointment.",
    visibility: index % 5 === 4 ? "private" : "public",
    bookingCount: 12 + index * 7,
    futureBookingCount: index % 4 === 0 ? 3 : 0,
    rating: Number((4.2 + (index % 7) * 0.1).toFixed(1)),
    status: statuses[index % statuses.length],
    updatedAt: new Date(2026, 6, 12 - index).toISOString(),
    rejectionReason: index % statuses.length === 3 ? "The service description must clarify professional qualifications and the products used." : undefined,
  };
});

export const emptyProviderServiceForm = {
  name: "", category: "", shortDescription: "", detailedDescription: "", basePrice: 0, duration: 60,
  petTypes: [] as string[], petSizes: [] as string[], deliveryType: "At provider facility", images: [],
  preparationInstructions: "", cancellationPolicy: "", visibility: "public" as const,
};

export async function getMockProviderServices(options?: { fail?: boolean }) {
  await new Promise<void>((resolve) => window.setTimeout(resolve, 550));
  if (options?.fail) throw new Error("Mock services could not be loaded.");
  return structuredClone(providerServicesMock);
}

export async function getMockProviderService(serviceId: string) {
  await new Promise<void>((resolve) => window.setTimeout(resolve, 450));
  return structuredClone(providerServicesMock.find((item) => item.id === serviceId) ?? providerServicesMock[0]);
}
