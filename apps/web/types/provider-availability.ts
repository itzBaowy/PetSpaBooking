export type AvailabilityDayName = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
export type AvailabilitySlotState = "available" | "blocked" | "booked" | "holiday";

export interface AvailabilityTimeRange { id: string; start: string; end: string; }
export interface WeeklyDaySchedule { day: AvailabilityDayName; isOpen: boolean; ranges: AvailabilityTimeRange[]; }
export interface AvailabilityException { id: string; date: string; type: "holiday" | "special_hours" | "blocked_time"; title: string; ranges: AvailabilityTimeRange[]; }
export interface AvailabilityBooking { id: string; date: string; start: string; end: string; customerName: string; status: "confirmed"; }
export interface AvailabilitySettings { weeklySchedule: WeeklyDaySchedule[]; capacity: number; defaultSlotDuration: number; exceptions: AvailabilityException[]; bookings: AvailabilityBooking[]; }
export interface CalendarSlot { id: string; date: string; start: string; end: string; state: AvailabilitySlotState; label: string; bookingId?: string; }
