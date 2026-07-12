import { Request } from "express";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import prisma from "../../connect.prisma.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../common/helpers/exception.helper.ts";
import { adminAuditLogService } from "./admin-audit-log.service.ts";
import { notificationService } from "./notification.service.ts";

const WALLET_TRANSACTION_TYPES = [
  "ONLINE_EARNING",
  "CASH_COMMISSION_DEDUCTION",
  "DEPOSIT_COMMISSION_DEDUCTION",
  "MANUAL_ADJUSTMENT",
  "WITHDRAWAL_PAYOUT",
] as const;

const BALANCE_TYPES = ["WALLET", "DEPOSIT"] as const;
const MIN_PROVIDER_DEPOSIT = 300_000;

type WalletTransactionType = (typeof WALLET_TRANSACTION_TYPES)[number];
type BalanceType = (typeof BALANCE_TYPES)[number];

function getRouteParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestException(`Invalid route parameter: ${name}`);
  }

  return value;
}

function getRequesterId(req: Request): string {
  const userId = (req as Request & { user?: { userId?: string } }).user
    ?.userId;
  if (!userId) throw new UnauthorizedException("Unauthorized");
  return userId;
}

function getOptionalObjectId(value: unknown, name: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestException(`${name} must be a valid ObjectId`);
  }

  return value;
}

function getOptionalTransactionType(value: unknown) {
  if (value === undefined) return undefined;
  if (
    typeof value !== "string" ||
    !WALLET_TRANSACTION_TYPES.includes(value as WalletTransactionType)
  ) {
    throw new BadRequestException(
      `type must be one of: ${WALLET_TRANSACTION_TYPES.join(", ")}`,
    );
  }

  return value;
}

function getOptionalBalanceType(value: unknown) {
  if (value === undefined) return undefined;
  if (
    typeof value !== "string" ||
    !BALANCE_TYPES.includes(value as BalanceType)
  ) {
    throw new BadRequestException(
      `balanceType must be one of: ${BALANCE_TYPES.join(", ")}`,
    );
  }

  return value;
}

function getRequiredBalanceType(value: unknown): BalanceType {
  const balanceType = getOptionalBalanceType(value);
  if (!balanceType) {
    throw new BadRequestException(
      `balanceType must be one of: ${BALANCE_TYPES.join(", ")}`,
    );
  }

  return balanceType as BalanceType;
}

function getAdjustmentAmount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value === 0) {
    throw new BadRequestException("amount must be a non-zero number");
  }

  return value;
}

function getAdjustmentReason(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestException("reason is required");
  }

  return value.trim();
}

function getOptionalNote(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestException("adminNote must be a non-empty string");
  }

  return value.trim();
}

function getDepositStatusAfterAdjustment(depositBalance: number) {
  return depositBalance >= MIN_PROVIDER_DEPOSIT ? "ACTIVE" : "LOW_BALANCE";
}

export const adminFinanceService = {
  async getWalletTransactions(req: Request) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    const providerId = getOptionalObjectId(req.query.providerId, "providerId");
    const bookingId = getOptionalObjectId(req.query.bookingId, "bookingId");
    const type = getOptionalTransactionType(req.query.type);
    const balanceType = getOptionalBalanceType(req.query.balanceType);

    if (providerId) where.providerId = providerId;
    if (bookingId) where.bookingId = bookingId;
    if (type) where.type = type;
    if (balanceType) where.balanceType = balanceType;

    const [totalItems, items] = await Promise.all([
      prisma.wallet_transactions.count({ where }),
      prisma.wallet_transactions.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: { createAt: "desc" },
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              providerStatus: true,
              walletBalance: true,
              depositBalance: true,
              depositStatus: true,
            },
          },
          booking: {
            select: {
              id: true,
              status: true,
              paymentMethod: true,
              paymentStatus: true,
              totalAmount: true,
              commissionAmount: true,
              providerEarning: true,
              commissionProcessedAt: true,
              service: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
              customer: {
                select: {
                  id: true,
                  users: {
                    select: {
                      id: true,
                      fullName: true,
                      userName: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

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

  async getProviderWallet(req: Request) {
    const id = getRouteParam(req, "id");

    const provider = await prisma.providers.findUnique({
      where: { id },
      select: {
        id: true,
        businessName: true,
        providerStatus: true,
        depositStatus: true,
        depositBalance: true,
        walletBalance: true,
        walletTransactions: {
          orderBy: { createAt: "desc" },
          take: 10,
        },
      },
    });

    if (!provider) {
      throw new NotFoundException("Provider not found");
    }

    const [totalTransactions, walletIn, walletOut, depositOut] =
      await Promise.all([
        prisma.wallet_transactions.count({ where: { providerId: id } }),
        prisma.wallet_transactions.aggregate({
          where: { providerId: id, balanceType: "WALLET", amount: { gt: 0 } },
          _sum: { amount: true },
        }),
        prisma.wallet_transactions.aggregate({
          where: { providerId: id, balanceType: "WALLET", amount: { lt: 0 } },
          _sum: { amount: true },
        }),
        prisma.wallet_transactions.aggregate({
          where: { providerId: id, balanceType: "DEPOSIT", amount: { lt: 0 } },
          _sum: { amount: true },
        }),
      ]);

    return {
      provider: {
        id: provider.id,
        businessName: provider.businessName,
        providerStatus: provider.providerStatus,
        depositStatus: provider.depositStatus,
      },
      balances: {
        walletBalance: provider.walletBalance,
        depositBalance: provider.depositBalance,
      },
      totals: {
        totalTransactions,
        walletIn: walletIn._sum.amount ?? 0,
        walletOut: walletOut._sum.amount ?? 0,
        depositOut: depositOut._sum.amount ?? 0,
      },
      recentTransactions: provider.walletTransactions,
    };
  },

  async getBookingFinance(req: Request) {
    const id = getRouteParam(req, "id");

    const booking = await prisma.bookings.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            walletBalance: true,
            depositBalance: true,
            depositStatus: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
        dispute: {
          select: {
            id: true,
            status: true,
            reason: true,
            resolvedAt: true,
          },
        },
        walletTransactions: {
          orderBy: { createAt: "desc" },
        },
        paymentTransactions: {
          orderBy: { createAt: "desc" },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return {
      booking: {
        id: booking.id,
        status: booking.status,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        checkedOutAt: booking.checkedOutAt,
        completedAt: booking.completedAt,
      },
      commission: {
        commissionAmount: booking.commissionAmount ?? 0,
        providerEarning: booking.providerEarning ?? 0,
        walletCommissionAmount: booking.walletCommissionAmount ?? 0,
        depositCommissionAmount: booking.depositCommissionAmount ?? 0,
        processingStartedAt: booking.commissionProcessingStartedAt,
        processedAt: booking.commissionProcessedAt,
      },
      provider: booking.provider,
      service: booking.service,
      dispute: booking.dispute,
      walletTransactions: booking.walletTransactions,
      paymentTransactions: booking.paymentTransactions,
    };
  },

  async getRefunds(req: Request) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    where.paymentMethod = "ONLINE";
    where.paymentStatus = "REFUND_PENDING";

    const [totalItems, items] = await Promise.all([
      prisma.bookings.count({ where }),
      prisma.bookings.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: { cancelledAt: "desc" },
        include: {
          customer: {
            include: {
              users: {
                select: {
                  id: true,
                  userName: true,
                  fullName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          provider: {
            select: {
              id: true,
              businessName: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          paymentTransactions: {
            orderBy: { createAt: "desc" },
            take: 3,
          },
        },
      }),
    ]);

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

  async getRefundByBookingId(req: Request) {
    const bookingId = getRouteParam(req, "bookingId");

    const booking = await prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          include: {
            users: true,
          },
        },
        provider: true,
        service: true,
        dispute: true,
        paymentTransactions: {
          orderBy: { createAt: "desc" },
        },
      },
    });

    if (!booking || booking.paymentStatus !== "REFUND_PENDING") {
      throw new NotFoundException("Refund request not found");
    }

    return booking;
  },

  async markRefunded(req: Request) {
    const adminId = getRequesterId(req);
    const bookingId = getRouteParam(req, "bookingId");
    const adminNote = getOptionalNote(req.body?.adminNote);
    const refundReference = getOptionalNote(req.body?.refundReference);

    const booking = await prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!booking || booking.paymentStatus !== "REFUND_PENDING") {
      throw new NotFoundException("Refund request not found");
    }

    const updatedBooking = await prisma.bookings.update({
      where: { id: booking.id },
      data: {
        paymentStatus: "REFUNDED",
        paymentReference: refundReference ?? booking.paymentReference,
        note: adminNote ? `${booking.note ?? ""}\n[Refund] ${adminNote}`.trim() : booking.note,
      },
      include: {
        customer: {
          include: {
            users: true,
          },
        },
        provider: true,
        service: true,
        paymentTransactions: {
          orderBy: { createAt: "desc" },
        },
      },
    });

    await notificationService.safeCreate({
      userId: updatedBooking.customer.users.id,
      type: "REFUND_COMPLETED",
      title: "Refund completed",
      message: "Your cancelled online booking has been marked as refunded.",
      data: {
        bookingId: updatedBooking.id,
        refundReference,
      },
    });

    await adminAuditLogService.safeLog({
      adminId,
      action: "REFUND_MARK_REFUNDED",
      targetType: "BOOKING",
      targetId: booking.id,
      metadata: {
        previousPaymentStatus: booking.paymentStatus,
        paymentStatus: "REFUNDED",
        refundReference,
        adminNote,
      },
    });

    return updatedBooking;
  },

  async rejectRefund(req: Request) {
    const adminId = getRequesterId(req);
    const bookingId = getRouteParam(req, "bookingId");
    const adminNote = getOptionalNote(req.body?.adminNote);

    if (!adminNote) {
      throw new BadRequestException("adminNote is required");
    }

    const booking = await prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!booking || booking.paymentStatus !== "REFUND_PENDING") {
      throw new NotFoundException("Refund request not found");
    }

    const updatedBooking = await prisma.bookings.update({
      where: { id: booking.id },
      data: {
        paymentStatus: "SUCCESS",
        note: `${booking.note ?? ""}\n[Refund rejected] ${adminNote}`.trim(),
      },
      include: {
        customer: {
          include: {
            users: true,
          },
        },
        provider: true,
        service: true,
        paymentTransactions: {
          orderBy: { createAt: "desc" },
        },
      },
    });

    await notificationService.safeCreate({
      userId: updatedBooking.customer.users.id,
      type: "REFUND_REJECTED",
      title: "Refund rejected",
      message: "Your refund request was rejected by admin.",
      data: {
        bookingId: updatedBooking.id,
        adminNote,
      },
    });

    await adminAuditLogService.safeLog({
      adminId,
      action: "REFUND_REJECT",
      targetType: "BOOKING",
      targetId: booking.id,
      metadata: {
        previousPaymentStatus: booking.paymentStatus,
        paymentStatus: "SUCCESS",
        adminNote,
      },
    });

    return updatedBooking;
  },

  async adjustProviderWallet(req: Request) {
    const adminId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const balanceType = getRequiredBalanceType(req.body?.balanceType);
    const amount = getAdjustmentAmount(req.body?.amount);
    const reason = getAdjustmentReason(req.body?.reason);

    const result = await prisma.$transaction(async (tx) => {
      const provider = await tx.providers.findUnique({
        where: { id },
        select: {
          id: true,
          businessName: true,
          walletBalance: true,
          depositBalance: true,
          depositStatus: true,
        },
      });

      if (!provider) {
        throw new NotFoundException("Provider not found");
      }

      const currentBalance =
        balanceType === "WALLET"
          ? provider.walletBalance
          : provider.depositBalance;
      const balanceAfter = currentBalance + amount;

      if (balanceAfter < 0) {
        throw new BadRequestException(`${balanceType} balance cannot be negative`);
      }

      const updatedProvider = await tx.providers.update({
        where: { id },
        data:
          balanceType === "WALLET"
            ? { walletBalance: { increment: amount } }
            : {
                depositBalance: { increment: amount },
                depositStatus: getDepositStatusAfterAdjustment(balanceAfter),
              },
        select: {
          id: true,
          businessName: true,
          walletBalance: true,
          depositBalance: true,
          depositStatus: true,
        },
      });

      const transaction = await tx.wallet_transactions.create({
        data: {
          providerId: provider.id,
          idempotencyKey: `manual-adjustment:${crypto.randomUUID()}`,
          type: "MANUAL_ADJUSTMENT",
          balanceType,
          amount,
          balanceAfter:
            balanceType === "WALLET"
              ? updatedProvider.walletBalance
              : updatedProvider.depositBalance,
          note: reason,
        },
      });

      return {
        provider: updatedProvider,
        transaction,
      };
    });

    await adminAuditLogService.safeLog({
      adminId,
      action: "PROVIDER_WALLET_ADJUST",
      targetType: "PROVIDER",
      targetId: id,
      metadata: {
        balanceType,
        amount,
        reason,
        transactionId: result.transaction.id,
      },
    });

    return result;
  },
};
