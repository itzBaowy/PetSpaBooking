import type {
  ProviderVerificationProfile,
  ProviderVerificationStatus,
  ProviderVerificationTimelineItem,
} from "@/types/provider";

export const verificationStatusOptions: Array<{
  value: ProviderVerificationStatus;
  label: string;
}> = [
  { value: "not_submitted", label: "Not submitted" },
  { value: "pending", label: "Pending review" },
  { value: "requires_changes", label: "Requires changes" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

const baseTimeline: ProviderVerificationTimelineItem[] = [
  { id: "timeline-1", title: "Application created", description: "Provider verification application was opened.", occurredAt: "2026-07-08T09:15:00+07:00", state: "complete" },
  { id: "timeline-2", title: "Documents submitted", description: "Four required documents were added for review.", occurredAt: "2026-07-09T14:30:00+07:00", state: "complete" },
  { id: "timeline-3", title: "OCR screening", description: "Automated document checks were completed.", occurredAt: "2026-07-09T14:34:00+07:00", state: "complete" },
  { id: "timeline-4", title: "Admin review", description: "The PetLink compliance team is reviewing the application.", occurredAt: "2026-07-10T08:00:00+07:00", state: "current" },
  { id: "timeline-5", title: "Final decision", description: "The provider will be notified when review is complete.", occurredAt: "", state: "upcoming" },
];

export const providerVerificationMock: ProviderVerificationProfile = {
  applicationId: "PV-2026-0719",
  status: "pending",
  lastSubmittedAt: "2026-07-09T14:30:00+07:00",
  business: {
    businessName: "Paws & Relax Pet Spa",
    representativeName: "Nguyen Minh Anh",
    phone: "+84 912 345 678",
    email: "hello@pawsrelax.vn",
    address: "128 Nguyen Van Linh, Hai Chau, Da Nang",
    serviceCategories: ["Pet grooming", "Spa treatment", "Nail care"],
    operatingModel: "Single-location pet care studio",
  },
  documents: [
    { id: "doc-license", filename: "business-license-2026.pdf", type: "Business license", uploadedAt: "2026-07-09T14:12:00+07:00", ocrStatus: "matched", reviewStatus: "approved", previewKind: "document" },
    { id: "doc-id", filename: "representative-id-front.jpg", type: "Representative identification", uploadedAt: "2026-07-09T14:16:00+07:00", ocrStatus: "matched", reviewStatus: "approved", previewKind: "image" },
    { id: "doc-certificate", filename: "professional-grooming-certificate.pdf", type: "Professional certificate", uploadedAt: "2026-07-09T14:20:00+07:00", ocrStatus: "needs_review", reviewStatus: "in_review", previewKind: "document" },
    { id: "doc-facility", filename: "facility-reception.jpg", type: "Facility image", uploadedAt: "2026-07-09T14:24:00+07:00", ocrStatus: "not_required", reviewStatus: "in_review", previewKind: "image" },
    { id: "doc-additional", filename: "fire-safety-record.pdf", type: "Additional document", uploadedAt: "2026-07-09T14:28:00+07:00", ocrStatus: "matched", reviewStatus: "not_reviewed", previewKind: "document" },
  ],
  feedback: {
    reason: "Some submitted information could not be verified against the documents.",
    fields: ["Facility address", "Representative phone number"],
    documents: ["Professional certificate", "Facility image"],
    adminNote: "Please upload a clearer certificate scan and a wider photo showing the treatment area and safety equipment.",
    deadline: "2026-07-24T23:59:00+07:00",
  },
  timeline: baseTimeline,
};

export function timelineForStatus(status: ProviderVerificationStatus) {
  if (status === "not_submitted") {
    return baseTimeline.map((item, index) => ({ ...item, state: index === 0 ? "current" as const : "upcoming" as const, occurredAt: index === 0 ? item.occurredAt : "" }));
  }
  if (status === "approved") {
    return baseTimeline.map((item) => ({ ...item, state: "complete" as const, occurredAt: item.occurredAt || "2026-07-11T16:05:00+07:00" }));
  }
  if (["requires_changes", "rejected", "suspended"].includes(status)) {
    return baseTimeline.map((item, index) => ({ ...item, state: index <= 3 ? "complete" as const : index === 4 ? "current" as const : "upcoming" as const, occurredAt: item.occurredAt || "2026-07-11T16:05:00+07:00" }));
  }
  return baseTimeline;
}
