import cron, { ScheduledTask } from "node-cron";
import prisma from "../../connect.prisma.ts";
import { bookingFinanceService } from "../services/booking-finance.service.ts";
import { getBookingAutoCompleteHours } from "../services/mobile-services/booking.service.ts";

const DEFAULT_INTERVAL_MINUTES = 5;
const ACTIVE_DISPUTE_STATUSES = ["PENDING"];

function getCronIntervalMinutes(): number {
  const value = Number(process.env.BOOKING_AUTO_COMPLETE_CRON_INTERVAL_MINUTES);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_INTERVAL_MINUTES;
}

function getCronExpression(): string {
  const intervalMinutes = getCronIntervalMinutes();
  if (intervalMinutes >= 60) {
    return "0 * * * *";
  }

  return `*/${Math.floor(intervalMinutes)} * * * *`;
}

function getAutoCompleteCutoff(): Date {
  return new Date(
    Date.now() - getBookingAutoCompleteHours() * 60 * 60 * 1000,
  );
}

export async function autoCompleteCheckedOutBookings(): Promise<number> {
  const cutoff = getAutoCompleteCutoff();

  const activeDisputes = await prisma.booking_disputes.findMany({
    where: { status: { in: ACTIVE_DISPUTE_STATUSES } },
    select: { bookingId: true },
  });

  const excludedBookingIds = activeDisputes.map((dispute) => dispute.bookingId);

  const bookings = await prisma.bookings.findMany({
    where: {
      status: "CHECKED_OUT",
      checkedOutAt: { lte: cutoff },
      ...(excludedBookingIds.length > 0
        ? { id: { notIn: excludedBookingIds } }
        : {}),
    },
    select: { id: true },
  });

  let completedCount = 0;

  for (const booking of bookings) {
    const updated =
      await bookingFinanceService.completeBookingAndProcessCommission(
        booking.id,
      );
    if (updated?.status === "COMPLETED") {
      completedCount++;
    }
  }

  if (completedCount > 0) {
    console.log(
      `[booking-auto-complete] Auto-completed ${completedCount} booking(s).`,
    );
  }

  return completedCount;
}

export function startBookingAutoCompleteJob(): ScheduledTask {
  const cronExpression = getCronExpression();

  console.log(
    `[booking-auto-complete] Started. holdHours=${getBookingAutoCompleteHours()}, cron="${cronExpression}"`,
  );

  void autoCompleteCheckedOutBookings().catch((error: unknown) => {
    console.error("[booking-auto-complete] Initial run failed:", error);
  });

  return cron.schedule(cronExpression, () => {
    void autoCompleteCheckedOutBookings().catch((error: unknown) => {
      console.error("[booking-auto-complete] Run failed:", error);
    });
  });
}
