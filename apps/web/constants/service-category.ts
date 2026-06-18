export const SERVICE_CATEGORIES = {
  GROOMING: "grooming",
  TRAINING: "training",
  BOARDING: "boarding",
  VETERINARY: "veterinary",
  WALKING: "walking",
  SITTING: "sitting",
  DAYCARE: "daycare",
} as const;

export type ServiceCategory =
  (typeof SERVICE_CATEGORIES)[keyof typeof SERVICE_CATEGORIES];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  grooming: "Grooming",
  training: "Training",
  boarding: "Boarding",
  veterinary: "Veterinary",
  walking: "Walking",
  sitting: "Pet Sitting",
  daycare: "Daycare",
};
