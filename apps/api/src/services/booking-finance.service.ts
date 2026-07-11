import prisma from "../../connect.prisma.ts";
import { notificationService } from "./notification.service.ts";

const PLATFORM_COMMISSION_RATE = 0.15;
const MIN_PROVIDER_DEPOSIT = 300_000;
const MAX_COMMISSION_PROCESSING_RETRIES = 5;

function calculateCommission(totalAmount: number) {
  const commissionAmount = Math.round(totalAmount * PLATFORM_COMMISSION_RATE);
  const providerEarning = totalAmount - commissionAmount;

  return { commissionAmount, providerEarning };
}

function getDepositStatusAfterDeduction(depositBalance: number): string {
  return depositBalance >= MIN_PROVIDER_DEPOSIT ? "ACTIVE" : "LOW_BALANCE";
}

function getBookingLedgerKey(
  bookingId: string,
  type: string,
  balanceType: string,
) {
  return `booking:${bookingId}:${type}:${balanceType}`;
}

function isTransactionWriteConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2034"
  );
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const bookingFinanceService = {
  async processCompletedBookingCommission(bookingId: string) {
    for (
      let attempt = 1;
      attempt <= MAX_COMMISSION_PROCESSING_RETRIES;
      attempt += 1
    ) {
      try {
        return await prisma.$transaction(async (tx) => {
          const now = new Date();
          const claim = await tx.bookings.updateMany({
            where: {
              id: bookingId,
              status: "COMPLETED",
              AND: [
                {
                  OR: [
                    { commissionProcessedAt: null },
                    { commissionProcessedAt: { isSet: false } },
                  ],
                },
                {
                  OR: [
                    { commissionProcessingStartedAt: null },
                    { commissionProcessingStartedAt: { isSet: false } },
                  ],
                },
              ],
            },
            data: {
              commissionProcessingStartedAt: now,
            },
          });

          if (claim.count === 0) {
            return tx.bookings.findUnique({ where: { id: bookingId } });
          }

          const booking = await tx.bookings.findUnique({
            where: { id: bookingId },
          });

          if (!booking || booking.status !== "COMPLETED") {
            return null;
          }

          const provider = await tx.providers.findUnique({
            where: { id: booking.providerId },
          });

          if (!provider) {
            throw new Error("Provider not found for completed booking");
          }

          const { commissionAmount, providerEarning } = calculateCommission(
            booking.totalAmount,
          );

          if (booking.paymentMethod === "ONLINE") {
            const updatedProvider = await tx.providers.update({
              where: { id: provider.id },
              data: { walletBalance: { increment: providerEarning } },
              select: { walletBalance: true },
            });

            if (providerEarning !== 0) {
              await tx.wallet_transactions.create({
                data: {
                  providerId: provider.id,
                  bookingId: booking.id,
                  idempotencyKey: getBookingLedgerKey(
                    booking.id,
                    "ONLINE_EARNING",
                    "WALLET",
                  ),
                  type: "ONLINE_EARNING",
                  balanceType: "WALLET",
                  amount: providerEarning,
                  balanceAfter: updatedProvider.walletBalance,
                  note: "Provider earning from online booking",
                },
              });
            }

            return tx.bookings.update({
              where: { id: booking.id },
              data: {
                commissionAmount,
                providerEarning,
                walletCommissionAmount: 0,
                depositCommissionAmount: 0,
                commissionProcessedAt: now,
              },
            });
          }

          const walletCommissionAmount = Math.min(
            provider.walletBalance,
            commissionAmount,
          );
          const depositCommissionAmount =
            commissionAmount - walletCommissionAmount;
          const estimatedDepositBalanceAfter =
            provider.depositBalance - depositCommissionAmount;

          const updatedProvider = await tx.providers.update({
            where: { id: provider.id },
            data: {
              walletBalance: { decrement: walletCommissionAmount },
              depositBalance: { decrement: depositCommissionAmount },
              depositStatus: getDepositStatusAfterDeduction(
                estimatedDepositBalanceAfter,
              ),
            },
            select: { walletBalance: true, depositBalance: true },
          });

          if (walletCommissionAmount > 0) {
            await tx.wallet_transactions.create({
              data: {
                providerId: provider.id,
                bookingId: booking.id,
                idempotencyKey: getBookingLedgerKey(
                  booking.id,
                  "CASH_COMMISSION_DEDUCTION",
                  "WALLET",
                ),
                type: "CASH_COMMISSION_DEDUCTION",
                balanceType: "WALLET",
                amount: -walletCommissionAmount,
                balanceAfter: updatedProvider.walletBalance,
                note: "Platform commission deducted from wallet for cash booking",
              },
            });
          }

          if (depositCommissionAmount > 0) {
            await tx.wallet_transactions.create({
              data: {
                providerId: provider.id,
                bookingId: booking.id,
                idempotencyKey: getBookingLedgerKey(
                  booking.id,
                  "DEPOSIT_COMMISSION_DEDUCTION",
                  "DEPOSIT",
                ),
                type: "DEPOSIT_COMMISSION_DEDUCTION",
                balanceType: "DEPOSIT",
                amount: -depositCommissionAmount,
                balanceAfter: updatedProvider.depositBalance,
                note: "Platform commission deducted from deposit for cash booking",
              },
            });
          }

          return tx.bookings.update({
            where: { id: booking.id },
            data: {
              commissionAmount,
              providerEarning,
              walletCommissionAmount,
              depositCommissionAmount,
              commissionProcessedAt: now,
            },
          });
        });
      } catch (error) {
        if (
          !isTransactionWriteConflict(error) ||
          attempt === MAX_COMMISSION_PROCESSING_RETRIES
        ) {
          throw error;
        }

        await wait(attempt * 50);
      }
    }

    return prisma.bookings.findUnique({ where: { id: bookingId } });
  },

  async completeBookingAndProcessCommission(bookingId: string) {
    const completed = await prisma.bookings.updateMany({
      where: {
        id: bookingId,
        status: "CHECKED_OUT",
        OR: [
          { commissionProcessedAt: null },
          { commissionProcessedAt: { isSet: false } },
        ],
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    const booking = await this.processCompletedBookingCommission(bookingId);

    if (completed.count > 0 && booking?.status === "COMPLETED") {
      const completedBooking = await prisma.bookings.findUnique({
        where: { id: bookingId },
        include: {
          customer: { select: { userId: true } },
          provider: { select: { userId: true, businessName: true } },
        },
      });

      if (completedBooking) {
        await notificationService.createMany([
          {
            userId: completedBooking.customer.userId,
            type: "BOOKING_COMPLETED",
            title: "Booking completed",
            message: "Your booking has been completed.",
            data: { bookingId },
          },
          {
            userId: completedBooking.provider.userId,
            type: "BOOKING_COMPLETED",
            title: "Booking completed",
            message: `A booking for ${completedBooking.provider.businessName} has been completed.`,
            data: { bookingId },
          },
        ]);
      }
    }

    return booking;
  },
};
