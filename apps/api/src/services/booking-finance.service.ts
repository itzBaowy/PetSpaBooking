import prisma from "../../connect.prisma.ts";

const PLATFORM_COMMISSION_RATE = 0.15;
const MIN_PROVIDER_DEPOSIT = 300_000;

function calculateCommission(totalAmount: number) {
  const commissionAmount = Math.round(totalAmount * PLATFORM_COMMISSION_RATE);
  const providerEarning = totalAmount - commissionAmount;

  return { commissionAmount, providerEarning };
}

function getDepositStatusAfterDeduction(depositBalance: number): string {
  return depositBalance >= MIN_PROVIDER_DEPOSIT ? "ACTIVE" : "LOW_BALANCE";
}

export const bookingFinanceService = {
  async processCompletedBookingCommission(bookingId: string) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({
        where: { id: bookingId },
      });

      if (!booking || booking.status !== "COMPLETED") {
        return null;
      }

      if (booking.commissionProcessedAt) {
        return booking;
      }

      const provider = await tx.providers.findUnique({
        where: { id: booking.providerId },
      });

      if (!provider) {
        throw new Error("Provider not found for completed booking");
      }

      const now = new Date();
      const { commissionAmount, providerEarning } = calculateCommission(
        booking.totalAmount,
      );

      if (booking.paymentMethod === "ONLINE") {
        const walletBalanceAfter = provider.walletBalance + providerEarning;

        await tx.providers.update({
          where: { id: provider.id },
          data: { walletBalance: walletBalanceAfter },
        });

        if (providerEarning !== 0) {
          await tx.wallet_transactions.create({
            data: {
              providerId: provider.id,
              bookingId: booking.id,
              type: "ONLINE_EARNING",
              balanceType: "WALLET",
              amount: providerEarning,
              balanceAfter: walletBalanceAfter,
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
      const walletBalanceAfter =
        provider.walletBalance - walletCommissionAmount;
      const depositBalanceAfter =
        provider.depositBalance - depositCommissionAmount;

      await tx.providers.update({
        where: { id: provider.id },
        data: {
          walletBalance: walletBalanceAfter,
          depositBalance: depositBalanceAfter,
          depositStatus: getDepositStatusAfterDeduction(depositBalanceAfter),
        },
      });

      if (walletCommissionAmount > 0) {
        await tx.wallet_transactions.create({
          data: {
            providerId: provider.id,
            bookingId: booking.id,
            type: "CASH_COMMISSION_DEDUCTION",
            balanceType: "WALLET",
            amount: -walletCommissionAmount,
            balanceAfter: walletBalanceAfter,
            note: "Platform commission deducted from wallet for cash booking",
          },
        });
      }

      if (depositCommissionAmount > 0) {
        await tx.wallet_transactions.create({
          data: {
            providerId: provider.id,
            bookingId: booking.id,
            type: "DEPOSIT_COMMISSION_DEDUCTION",
            balanceType: "DEPOSIT",
            amount: -depositCommissionAmount,
            balanceAfter: depositBalanceAfter,
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
  },

  async completeBookingAndProcessCommission(bookingId: string) {
    await prisma.bookings.updateMany({
      where: {
        id: bookingId,
        status: "CHECKED_OUT",
        commissionProcessedAt: null,
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return this.processCompletedBookingCommission(bookingId);
  },
};
