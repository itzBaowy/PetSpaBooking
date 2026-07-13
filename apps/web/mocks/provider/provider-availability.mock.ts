import type { AvailabilitySettings } from "@/types/provider-availability";

const range = (id: string, start: string, end: string) => ({ id, start, end });

export const providerAvailabilityMock: AvailabilitySettings = {
  capacity: 3,
  defaultSlotDuration: 60,
  weeklySchedule: [
    { day: "Monday", isOpen: true, ranges: [range("mon-am", "08:00", "12:00"), range("mon-pm", "13:30", "18:00")] },
    { day: "Tuesday", isOpen: true, ranges: [range("tue-am", "08:00", "12:00"), range("tue-pm", "13:30", "18:00")] },
    { day: "Wednesday", isOpen: true, ranges: [range("wed-am", "08:00", "12:00"), range("wed-pm", "13:30", "18:00")] },
    { day: "Thursday", isOpen: true, ranges: [range("thu-am", "08:00", "12:00"), range("thu-pm", "13:30", "18:00")] },
    { day: "Friday", isOpen: true, ranges: [range("fri-am", "08:00", "12:00"), range("fri-pm", "13:30", "19:00")] },
    { day: "Saturday", isOpen: true, ranges: [range("sat", "09:00", "17:00")] },
    { day: "Sunday", isOpen: false, ranges: [] },
  ],
  exceptions: [
    { id: "holiday-1", date: "2026-07-20", type: "holiday", title: "Facility maintenance day", ranges: [] },
    { id: "special-1", date: "2026-07-26", type: "special_hours", title: "Sunday community event", ranges: [range("special-range", "09:00", "14:00")] },
    { id: "blocked-1", date: "2026-07-17", type: "blocked_time", title: "Team training", ranges: [range("blocked-range", "14:00", "16:00")] },
  ],
  bookings: [
    { id: "booking-1", date: "2026-07-15", start: "09:00", end: "10:00", customerName: "Linh & Mochi", status: "confirmed" },
    { id: "booking-2", date: "2026-07-17", start: "10:00", end: "11:00", customerName: "Bao & Milo", status: "confirmed" },
    { id: "booking-3", date: "2026-07-21", start: "15:00", end: "16:00", customerName: "An & Nala", status: "confirmed" },
  ],
};

export async function getMockProviderAvailability(): Promise<AvailabilitySettings> {
  await new Promise<void>((resolve) => window.setTimeout(resolve, 600));
  return structuredClone(providerAvailabilityMock);
}
