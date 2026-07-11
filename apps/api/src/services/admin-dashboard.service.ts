import prisma from "../../connect.prisma.ts";

const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "DISPUTE",
  "NO_ARRIVAL",
] as const;

const DISPUTE_STATUSES = [
  "PENDING",
  "RESOLVED_PROVIDER_WIN",
  "RESOLVED_CUSTOMER_WIN",
  "CANCELLED",
] as const;

const PROVIDER_STATUSES = [
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
] as const;

const WITHDRAWAL_STATUSES = ["PENDING", "APPROVED", "REJECTED", "PAID"] as const;

type CountBucket<T extends readonly string[]> = Record<T[number], number>;

function emptyBucket<T extends readonly string[]>(
  values: T,
): CountBucket<T> {
  return values.reduce((acc, value) => {
    acc[value as T[number]] = 0;
    return acc;
  }, {} as CountBucket<T>);
}

function toBucket<T extends readonly string[]>(
  values: T,
  rows: Array<{ status?: string; providerStatus?: string; _count: number }>,
  key: "status" | "providerStatus",
): CountBucket<T> {
  const bucket = emptyBucket(values);

  for (const row of rows) {
    const value = row[key];
    if (value && values.includes(value)) {
      bucket[value as T[number]] = row._count;
    }
  }

  return bucket;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getSum(value: number | null | undefined) {
  return value ?? 0;
}

export const adminDashboardService = {
  async getSummary() {
    const today = startOfToday();

    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      providerStatusRows,
      bookingStatusRows,
      pendingCommission,
      totalProcessedCommission,
      totalProviderEarning,
      pendingDisputes,
      resolvedDisputesToday,
      disputeStatusRows,
      activeServices,
      hiddenServices,
      withdrawalStatusRows,
      paidWithdrawalsToday,
    ] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({ where: { role: "CUSTOMER" } }),
      prisma.providers.count(),
      prisma.providers.groupBy({
        by: ["providerStatus"],
        _count: true,
      }),
      prisma.bookings.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.bookings.aggregate({
        where: {
          status: "COMPLETED",
          OR: [
            { commissionProcessedAt: null },
            { commissionProcessedAt: { isSet: false } },
          ],
        },
        _sum: { totalAmount: true },
      }),
      prisma.bookings.aggregate({
        where: {
          commissionProcessedAt: { not: null },
        },
        _sum: { commissionAmount: true },
      }),
      prisma.bookings.aggregate({
        where: {
          commissionProcessedAt: { not: null },
        },
        _sum: { providerEarning: true },
      }),
      prisma.booking_disputes.count({ where: { status: "PENDING" } }),
      prisma.booking_disputes.count({
        where: {
          status: {
            in: ["RESOLVED_PROVIDER_WIN", "RESOLVED_CUSTOMER_WIN", "CANCELLED"],
          },
          resolvedAt: { gte: today },
        },
      }),
      prisma.booking_disputes.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.services.count({ where: { isActive: true, isHiddenByAdmin: false } }),
      prisma.services.count({ where: { isHiddenByAdmin: true } }),
      prisma.withdrawal_requests.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.withdrawal_requests.count({
        where: {
          status: "PAID",
          paidAt: { gte: today },
        },
      }),
    ]);

    const providerStatuses = toBucket(
      PROVIDER_STATUSES,
      providerStatusRows,
      "providerStatus",
    );
    const bookingStatuses = toBucket(
      BOOKING_STATUSES,
      bookingStatusRows,
      "status",
    );
    const disputeStatuses = toBucket(
      DISPUTE_STATUSES,
      disputeStatusRows,
      "status",
    );
    const withdrawalStatuses = toBucket(
      WITHDRAWAL_STATUSES,
      withdrawalStatusRows,
      "status",
    );

    return {
      users: {
        total: totalUsers,
        customers: totalCustomers,
        providers: totalProviders,
      },
      providers: {
        total: totalProviders,
        pendingVerification: providerStatuses.PENDING_VERIFICATION,
        verified: providerStatuses.VERIFIED,
        rejected: providerStatuses.REJECTED,
        suspended: providerStatuses.SUSPENDED,
        byStatus: providerStatuses,
      },
      bookings: {
        pending: bookingStatuses.PENDING,
        confirmed: bookingStatuses.CONFIRMED,
        checkedIn: bookingStatuses.CHECKED_IN,
        checkedOut: bookingStatuses.CHECKED_OUT,
        dispute: bookingStatuses.DISPUTE,
        completed: bookingStatuses.COMPLETED,
        cancelled: bookingStatuses.CANCELLED,
        rejected: bookingStatuses.REJECTED,
        noArrival: bookingStatuses.NO_ARRIVAL,
        byStatus: bookingStatuses,
      },
      finance: {
        totalProcessedCommission: getSum(
          totalProcessedCommission._sum.commissionAmount,
        ),
        totalProviderEarning: getSum(totalProviderEarning._sum.providerEarning),
        pendingCommissionBookingAmount: getSum(
          pendingCommission._sum.totalAmount,
        ),
      },
      disputes: {
        pending: pendingDisputes,
        resolvedToday: resolvedDisputesToday,
        byStatus: disputeStatuses,
      },
      services: {
        active: activeServices,
        hiddenByAdmin: hiddenServices,
      },
      withdrawals: {
        pending: withdrawalStatuses.PENDING,
        approved: withdrawalStatuses.APPROVED,
        rejected: withdrawalStatuses.REJECTED,
        paid: withdrawalStatuses.PAID,
        paidToday: paidWithdrawalsToday,
        byStatus: withdrawalStatuses,
      },
    };
  },
};
