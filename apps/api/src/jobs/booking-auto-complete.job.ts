import cron, { ScheduledTask } from "node-cron";
import prisma from "../../connect.prisma.ts";
import { bookingFinanceService } from "../services/booking-finance.service.ts";
import { getBookingAutoCompleteHours } from "../services/mobile-services/booking.service.ts";

const DEFAULT_INTERVAL_MINUTES = 5;
const ACTIVE_DISPUTE_STATUSES = ["PENDING"];

export function getCronIntervalMinutes(): number {
  const rawValue = process.env.BOOKING_AUTO_COMPLETE_CRON_INTERVAL_MINUTES;
  if (!rawValue) return DEFAULT_INTERVAL_MINUTES;

  const trimmedValue = rawValue.trim();
  if (!/^\d+$/.test(trimmedValue)) {
    console.warn(
      `[booking-auto-complete] Invalid BOOKING_AUTO_COMPLETE_CRON_INTERVAL_MINUTES="${rawValue}". Falling back to ${DEFAULT_INTERVAL_MINUTES}.`,
    );
    return DEFAULT_INTERVAL_MINUTES;
  }

  return Math.max(Number.parseInt(trimmedValue, 10), 1);
}

export function getCronExpression(): string {
  const intervalMinutes = getCronIntervalMinutes();

  if (intervalMinutes < 60) {
    return `*/${intervalMinutes} * * * *`;
  }

  if (intervalMinutes % 60 === 0) {
    const intervalHours = intervalMinutes / 60;
    return `0 */${intervalHours} * * *`;
  }

  console.warn(
    `[booking-auto-complete] Cron cannot represent every ${intervalMinutes} minutes reliably. Falling back to every ${DEFAULT_INTERVAL_MINUTES} minutes.`,
  );
  return `*/${DEFAULT_INTERVAL_MINUTES} * * * *`;
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
