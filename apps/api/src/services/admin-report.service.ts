import { Request } from "express";
import prisma from "../../connect.prisma.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import { BadRequestException } from "../common/helpers/exception.helper.ts";

function getDateQuery(value: unknown, name: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new BadRequestException(`${name} must be a valid date`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${name} must be a valid date`);
  }

  return date;
}

function getDateRange(req: Request) {
  const from = getDateQuery(req.query.from, "from");
  const to = getDateQuery(req.query.to, "to");

  if (from && to && from.getTime() > to.getTime()) {
    throw new BadRequestException("from must be before to");
  }

  return { from, to };
}

function completedAtRange(from?: Date, to?: Date) {
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: from } : {}),
    ...(to ? { lte: to } : {}),
  };
}

function createDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getNumber(value: number | null | undefined) {
  return value ?? 0;
}

export const adminReportService = {
  async getRevenueSummary(req: Request) {
    const { from, to } = getDateRange(req);
    const completedAt = completedAtRange(from, to);
    const bookingWhere = {
      status: "COMPLETED",
      ...(completedAt ? { completedAt } : {}),
    };
    const withdrawalWhere = {
      status: "PAID",
      ...(from || to
        ? {
            paidAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [
      bookingTotals,
      completedBookings,
      cashBookings,
      onlineBookings,
      withdrawalTotals,
    ] = await Promise.all([
      prisma.bookings.aggregate({
        where: bookingWhere,
        _sum: {
          totalAmount: true,
          commissionAmount: true,
          providerEarning: true,
        },
      }),
      prisma.bookings.count({ where: bookingWhere }),
      prisma.bookings.count({
        where: { ...bookingWhere, paymentMethod: "CASH" },
      }),
      prisma.bookings.count({
        where: { ...bookingWhere, paymentMethod: "ONLINE" },
      }),
      prisma.withdrawal_requests.aggregate({
        where: withdrawalWhere,
        _sum: { amount: true },
      }),
    ]);

    return {
      range: {
        from: from ?? null,
        to: to ?? null,
      },
      totalBookingAmount: getNumber(bookingTotals._sum.totalAmount),
      totalCommission: getNumber(bookingTotals._sum.commissionAmount),
      totalProviderEarning: getNumber(bookingTotals._sum.providerEarning),
      completedBookings,
      cashBookings,
      onlineBookings,
      withdrawalPaidAmount: getNumber(withdrawalTotals._sum.amount),
    };
  },

  async getDailyRevenue(req: Request) {
    const { from, to } = getDateRange(req);
    const completedAt = completedAtRange(from, to);
    const bookings = await prisma.bookings.findMany({
      where: {
        status: "COMPLETED",
        ...(completedAt ? { completedAt } : {}),
      },
      select: {
        completedAt: true,
        totalAmount: true,
        commissionAmount: true,
        providerEarning: true,
      },
      orderBy: { completedAt: "asc" },
    });

    const byDate = new Map<
      string,
      {
        date: string;
        bookingAmount: number;
        commission: number;
        providerEarning: number;
        completedBookings: number;
      }
    >();

    for (const booking of bookings) {
      if (!booking.completedAt) continue;
      const date = createDateKey(booking.completedAt);
      const current =
        byDate.get(date) ?? {
          date,
          bookingAmount: 0,
          commission: 0,
          providerEarning: 0,
          completedBookings: 0,
        };

      current.bookingAmount += booking.totalAmount;
      current.commission += booking.commissionAmount ?? 0;
      current.providerEarning += booking.providerEarning ?? 0;
      current.completedBookings += 1;
      byDate.set(date, current);
    }

    return Array.from(byDate.values());
  },

  async getProviderPerformance(req: Request) {
    const { from, to } = getDateRange(req);
    const { page, pageSize, index } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );
    const completedAt = completedAtRange(from, to);

    const [totalItems, providers] = await Promise.all([
      prisma.providers.count(),
      prisma.providers.findMany({
        skip: index,
        take: pageSize,
        orderBy: { createAt: "desc" },
        select: {
          id: true,
          businessName: true,
          providerStatus: true,
          depositStatus: true,
          walletBalance: true,
        },
      }),
    ]);

    const items = await Promise.all(
      providers.map(async (provider) => {
        const bookingWhere = {
          providerId: provider.id,
          status: "COMPLETED",
          ...(completedAt ? { completedAt } : {}),
        };
        const disputeWhere = {
          providerId: provider.id,
          ...(from || to
            ? {
                createAt: {
                  ...(from ? { gte: from } : {}),
                  ...(to ? { lte: to } : {}),
                },
              }
            : {}),
        };

        const [bookingTotals, completedBookings, disputes, reviews] =
          await Promise.all([
            prisma.bookings.aggregate({
              where: bookingWhere,
              _sum: {
                totalAmount: true,
                commissionAmount: true,
              },
            }),
            prisma.bookings.count({ where: bookingWhere }),
            prisma.booking_disputes.count({ where: disputeWhere }),
            prisma.reviews.findMany({
              where: { providerId: provider.id, isHiddenByAdmin: false },
              select: { rating: true },
            }),
          ]);

        const averageRating =
          reviews.length > 0
            ? Math.round(
                (reviews.reduce((sum, review) => sum + review.rating, 0) /
                  reviews.length) *
                  10,
              ) / 10
            : 0;

        return {
          providerId: provider.id,
          businessName: provider.businessName,
          providerStatus: provider.providerStatus,
          depositStatus: provider.depositStatus,
          walletBalance: provider.walletBalance,
          completedBookings,
          totalRevenue: getNumber(bookingTotals._sum.totalAmount),
          commission: getNumber(bookingTotals._sum.commissionAmount),
          averageRating,
          totalReviews: reviews.length,
          disputes,
        };
      }),
    );

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  async getDisputeReport(req: Request) {
    const { from, to } = getDateRange(req);
    const where = {
      ...(from || to
        ? {
            createAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const rows = await prisma.booking_disputes.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    });

    const byStatus = {
      PENDING: 0,
      RESOLVED_PROVIDER_WIN: 0,
      RESOLVED_CUSTOMER_WIN: 0,
      CANCELLED: 0,
    };

    for (const row of rows) {
      if (row.status in byStatus) {
        byStatus[row.status as keyof typeof byStatus] = row._count._all;
      }
    }

    return {
      pending: byStatus.PENDING,
      resolvedProviderWin: byStatus.RESOLVED_PROVIDER_WIN,
      resolvedCustomerWin: byStatus.RESOLVED_CUSTOMER_WIN,
      cancelled: byStatus.CANCELLED,
      byStatus,
    };
  },
};
