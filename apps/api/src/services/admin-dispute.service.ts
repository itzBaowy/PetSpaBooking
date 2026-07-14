import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../connect.prisma.ts";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../common/helpers/exception.helper.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import { bookingFinanceService } from "./booking-finance.service.ts";
import { commissionRecordService } from "./commission-record.service.ts";
import { notificationService } from "./notification.service.ts";
import { adminAuditLogService } from "./admin-audit-log.service.ts";
import { getSystemSettingValue } from "./system-setting.service.ts";

const VALID_DISPUTE_STATUSES = [
  "PENDING",
  "RESOLVED_PROVIDER_WIN",
  "RESOLVED_CUSTOMER_WIN",
  "CANCELLED",
] as const;

const RESOLUTION_STATUSES = [
  "RESOLVED_PROVIDER_WIN",
  "RESOLVED_CUSTOMER_WIN",
  "CANCELLED",
] as const;

type DisputeStatus = (typeof VALID_DISPUTE_STATUSES)[number];
type ResolutionStatus = (typeof RESOLUTION_STATUSES)[number];

type EvidenceItem = {
  url: string;
  type?: string;
  title?: string;
  note?: string;
};

const DISPUTE_INCLUDE = {
  booking: {
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      totalAmount: true,
      refundAmount: true,
      refundRequestedAt: true,
      refundResolvedAt: true,
      refundMethod: true,
      refundReference: true,
      refundReason: true,
      checkedOutAt: true,
      completedAt: true,
      cancelledAt: true,
      commissionProcessedAt: true,
      customer: {
        select: {
          id: true,
          location: true,
          users: {
            select: {
              id: true,
              email: true,
              userName: true,
              fullName: true,
              phone: true,
            },
          },
        },
      },
      provider: {
        select: {
          id: true,
          userId: true,
          businessName: true,
          email: true,
          phone: true,
        },
      },
      service: {
        select: { id: true, name: true },
      },
    },
  },
} as const;

function getRequesterId(req: Request): string {
  const userId = (req as Request & { user?: { userId?: string } }).user
    ?.userId;
  if (!userId) throw new UnauthorizedException("Unauthorized");
  return userId;
}

function getRouteParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestException(`Invalid route parameter: ${name}`);
  }

  return value;
}

function getStatusFilter(value: unknown): DisputeStatus | undefined {
  if (value === undefined) return undefined;
  if (
    typeof value !== "string" ||
    !VALID_DISPUTE_STATUSES.includes(value as DisputeStatus)
  ) {
    throw new BadRequestException(
      `status must be one of: ${VALID_DISPUTE_STATUSES.join(", ")}`,
    );
  }

  return value as DisputeStatus;
}

function getResolutionStatus(value: unknown): ResolutionStatus {
  if (
    typeof value !== "string" ||
    !RESOLUTION_STATUSES.includes(value as ResolutionStatus)
  ) {
    throw new BadRequestException(
      `status must be one of: ${RESOLUTION_STATUSES.join(", ")}`,
    );
  }

  return value as ResolutionStatus;
}

function getOptionalAdminNote(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestException("adminNote must be a non-empty string");
  }

  return value.trim();
}

function getEvidence(value: unknown, fieldName: string): EvidenceItem[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new BadRequestException(`${fieldName} must be an array`);
  }
  if (value.length > 10) {
    throw new BadRequestException(`${fieldName} can contain at most 10 items`);
  }

  return value.map((item, index) => {
    if (typeof item === "string") {
      const url = item.trim();
      if (!url) {
        throw new BadRequestException(`${fieldName}[${index}] url is required`);
      }
      return { url };
    }

    if (typeof item !== "object" || item === null) {
      throw new BadRequestException(
        `${fieldName}[${index}] must be a string URL or object`,
      );
    }

    const raw = item as Record<string, unknown>;
    if (typeof raw.url !== "string" || !raw.url.trim()) {
      throw new BadRequestException(`${fieldName}[${index}].url is required`);
    }

    return {
      url: raw.url.trim(),
      type: typeof raw.type === "string" ? raw.type.trim() : undefined,
      title: typeof raw.title === "string" ? raw.title.trim() : undefined,
      note: typeof raw.note === "string" ? raw.note.trim() : undefined,
    };
  });
}

function encodeEvidence(evidence: EvidenceItem[]) {
  return evidence.length > 0 ? JSON.stringify(evidence) : null;
}

function decodeEvidence(value: string | null | undefined): EvidenceItem[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is EvidenceItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { url?: unknown }).url === "string",
    );
  } catch {
    return [];
  }
}

function getDisputeRefundAction(dispute: {
  id: string;
  bookingId: string;
  status: string;
  booking?: unknown;
}) {
  if (dispute.status !== "RESOLVED_CUSTOMER_WIN") return null;
  if (typeof dispute.booking !== "object" || dispute.booking === null) {
    return null;
  }

  const booking = dispute.booking as {
    id?: unknown;
    paymentMethod?: unknown;
    paymentStatus?: unknown;
    totalAmount?: unknown;
    refundAmount?: unknown;
    refundRequestedAt?: unknown;
    refundResolvedAt?: unknown;
    refundMethod?: unknown;
    refundReference?: unknown;
    refundReason?: unknown;
  };

  if (booking.paymentStatus === "REFUND_PENDING") {
    return {
      status: "PENDING",
      message: "This dispute was resolved in customer favor and is waiting for manual refund.",
      bookingId: dispute.bookingId,
      refundAmount:
        typeof booking.refundAmount === "number"
          ? booking.refundAmount
          : typeof booking.totalAmount === "number"
            ? booking.totalAmount
            : null,
      refundSource:
        booking.paymentMethod === "CASH"
          ? "PROVIDER_WALLET_DEPOSIT"
          : "ONLINE_PAYMENT",
      refundRequestedAt: booking.refundRequestedAt ?? null,
      refundReason: booking.refundReason ?? null,
      canOpenRefund: true,
      refundDetailPath: `/admin/refunds/${dispute.bookingId}`,
      refundDetailApi: `/api/admin/refunds/${dispute.bookingId}`,
    };
  }

  if (booking.paymentStatus === "REFUNDED") {
    return {
      status: "COMPLETED",
      message: "This dispute refund has been completed.",
      bookingId: dispute.bookingId,
      refundAmount:
        typeof booking.refundAmount === "number"
          ? booking.refundAmount
          : typeof booking.totalAmount === "number"
            ? booking.totalAmount
            : null,
      refundSource:
        booking.paymentMethod === "CASH"
          ? "PROVIDER_WALLET_DEPOSIT"
          : "ONLINE_PAYMENT",
      refundResolvedAt: booking.refundResolvedAt ?? null,
      refundMethod: booking.refundMethod ?? null,
      refundReference: booking.refundReference ?? null,
      canOpenRefund: false,
      refundDetailPath: null,
      refundDetailApi: null,
    };
  }

  return null;
}

function getBookingResolutionUpdate(status: ResolutionStatus, resolvedAt: Date) {
  if (status === "RESOLVED_CUSTOMER_WIN") {
    return {
      status: "CANCELLED",
      cancelledAt: resolvedAt,
    };
  }

  return {
    status: "COMPLETED",
    completedAt: resolvedAt,
  };
}

function shouldProcessCommission(status: ResolutionStatus) {
  return status === "RESOLVED_PROVIDER_WIN" || status === "CANCELLED";
}

function shouldCreateRefundPending(
  status: ResolutionStatus,
  booking: {
    paymentMethod: string;
    paymentStatus: string;
  },
) {
  if (status !== "RESOLVED_CUSTOMER_WIN") return false;
  if (booking.paymentMethod === "CASH") return true;

  return (
    booking.paymentMethod === "ONLINE" && booking.paymentStatus === "SUCCESS"
  );
}

function shouldDebitProviderForCashRefund(
  status: ResolutionStatus,
  booking: {
    paymentMethod: string;
  },
) {
  return status === "RESOLVED_CUSTOMER_WIN" && booking.paymentMethod === "CASH";
}

function getDepositStatusAfterDeduction(
  depositBalance: number,
  minProviderDeposit: number,
) {
  return depositBalance >= minProviderDeposit ? "ACTIVE" : "LOW_BALANCE";
}

function buildCustomerWinBookingUpdate(
  booking: {
    paymentMethod: string;
    paymentStatus: string;
    totalAmount: number;
  },
  dispute: {
    reason: string;
    description: string | null;
  },
  adminNote: string | null,
  resolvedAt: Date,
) {
  const baseUpdate = getBookingResolutionUpdate(
    "RESOLVED_CUSTOMER_WIN",
    resolvedAt,
  );

  const shouldRefund =
    booking.paymentMethod === "CASH" ||
    (booking.paymentMethod === "ONLINE" &&
      booking.paymentStatus === "SUCCESS");

  if (!shouldRefund) {
    return baseUpdate;
  }

  return {
    ...baseUpdate,
    paymentStatus: "REFUND_PENDING",
    refundReason: adminNote ?? dispute.description ?? dispute.reason,
    refundRequestedBy: "ADMIN",
    refundRequestedAt: resolvedAt,
    refundAmount: booking.totalAmount,
    refundResolvedAt: null,
    refundMethod: null,
    refundReference: null,
    refundEvidenceUrl: null,
    refundAdminNote: null,
  };
}

function getResolvedBookingUpdate(
  status: ResolutionStatus,
  booking: {
    paymentMethod: string;
    paymentStatus: string;
    totalAmount: number;
  },
  dispute: {
    reason: string;
    description: string | null;
  },
  adminNote: string | null,
  resolvedAt: Date,
) {
  if (status === "RESOLVED_CUSTOMER_WIN") {
    return buildCustomerWinBookingUpdate(
      booking,
      dispute,
      adminNote,
      resolvedAt,
    );
  }

  return getBookingResolutionUpdate(status, resolvedAt);
}

function mapDispute(dispute: {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  reason: string;
  description: string | null;
  evidence?: string | null;
  providerResponse?: string | null;
  providerEvidence?: string | null;
  providerRespondedAt?: Date | null;
  status: string;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  adminNote: string | null;
  adminEvidence?: string | null;
  createAt: Date;
  updateAt: Date;
  booking?: unknown;
}) {
  return {
    id: dispute.id,
    bookingId: dispute.bookingId,
    customerId: dispute.customerId,
    providerId: dispute.providerId,
    reason: dispute.reason,
    description: dispute.description,
    evidence: decodeEvidence(dispute.evidence),
    providerResponse: dispute.providerResponse ?? null,
    providerEvidence: decodeEvidence(dispute.providerEvidence),
    providerRespondedAt: dispute.providerRespondedAt ?? null,
    status: dispute.status,
    resolvedBy: dispute.resolvedBy,
    resolvedAt: dispute.resolvedAt,
    adminNote: dispute.adminNote,
    adminEvidence: decodeEvidence(dispute.adminEvidence),
    createdAt: dispute.createAt,
    updatedAt: dispute.updateAt,
    booking: dispute.booking,
    refundAction: getDisputeRefundAction(dispute),
  };
}

export const adminDisputeService = {
  async getAll(req: Request) {
    const { page, pageSize, index } = buildQueryPrisma(req.query);
    const status = getStatusFilter(req.query.status);
    const where = status ? { status } : {};

    const [items, totalItems] = await Promise.all([
      prisma.booking_disputes.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: { createAt: "desc" },
        include: DISPUTE_INCLUDE,
      }),
      prisma.booking_disputes.count({ where }),
    ]);

    return {
      items: items.map(mapDispute),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  },

  async getById(req: Request) {
    const id = getRouteParam(req, "id");
    const dispute = await prisma.booking_disputes.findUnique({
      where: { id },
      include: DISPUTE_INCLUDE,
    });

    if (!dispute) {
      throw new NotFoundException("Dispute not found");
    }

    return mapDispute(dispute);
  },

  async resolve(req: Request) {
    const adminId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const status = getResolutionStatus(req.body?.status);
    const adminNote = getOptionalAdminNote(req.body?.adminNote);
    const adminEvidence = getEvidence(req.body?.adminEvidence, "adminEvidence");
    const now = new Date();

    const dispute = await prisma.booking_disputes.findUnique({
      where: { id },
      include: DISPUTE_INCLUDE,
    });

    if (!dispute) {
      throw new NotFoundException("Dispute not found");
    }

    if (dispute.status !== "PENDING") {
      throw new BadRequestException("Only PENDING disputes can be resolved");
    }

    if (dispute.booking.status !== "DISPUTE") {
      throw new BadRequestException("Booking is not in DISPUTE status");
    }

    const shouldRefund = shouldCreateRefundPending(status, dispute.booking);
    const shouldDebitCashRefund = shouldDebitProviderForCashRefund(
      status,
      dispute.booking,
    );
    const minProviderDeposit = shouldDebitCashRefund
      ? await getSystemSettingValue("minProviderDeposit")
      : 0;

    const resolvedDispute = await prisma.$transaction(async (tx) => {
      const currentDispute = await tx.booking_disputes.findUnique({
        where: { id: dispute.id },
        select: { status: true },
      });
      if (currentDispute?.status !== "PENDING") {
        throw new BadRequestException("Dispute has already been resolved");
      }

      const updatedDispute = await tx.booking_disputes.update({
        where: { id: dispute.id },
        data: {
          status,
          resolvedBy: adminId,
          resolvedAt: now,
          adminNote,
          adminEvidence: encodeEvidence(adminEvidence),
        },
        include: DISPUTE_INCLUDE,
      });

      await tx.bookings.update({
        where: { id: dispute.bookingId },
        data: getResolvedBookingUpdate(
          status,
          dispute.booking,
          dispute,
          adminNote,
          now,
        ),
      });

      if (shouldDebitCashRefund && dispute.booking.totalAmount > 0) {
        const provider = await tx.providers.findUnique({
          where: { id: dispute.providerId },
          select: {
            id: true,
            walletBalance: true,
            depositBalance: true,
          },
        });

        if (!provider) {
          throw new NotFoundException("Provider not found");
        }

        const refundAmount = dispute.booking.totalAmount;
        const walletDebit = Math.min(provider.walletBalance, refundAmount);
        const depositDebit = refundAmount - walletDebit;
        const nextDepositBalance = provider.depositBalance - depositDebit;

        const updatedProvider = await tx.providers.update({
          where: { id: provider.id },
          data: {
            ...(walletDebit > 0
              ? { walletBalance: { decrement: walletDebit } }
              : {}),
            ...(depositDebit > 0
              ? {
                  depositBalance: { decrement: depositDebit },
                  depositStatus: getDepositStatusAfterDeduction(
                    nextDepositBalance,
                    minProviderDeposit,
                  ),
                }
              : {}),
          },
          select: {
            walletBalance: true,
            depositBalance: true,
          },
        });

        if (walletDebit > 0) {
          await tx.wallet_transactions.create({
            data: {
              providerId: provider.id,
              bookingId: dispute.bookingId,
              idempotencyKey: `cash-refund:${dispute.bookingId}:WALLET`,
              type: "CASH_REFUND_DEDUCTION",
              balanceType: "WALLET",
              amount: -walletDebit,
              balanceAfter: updatedProvider.walletBalance,
              note: "Cash booking refund after customer won dispute",
            },
          });
        }

        if (depositDebit > 0) {
          await tx.wallet_transactions.create({
            data: {
              providerId: provider.id,
              bookingId: dispute.bookingId,
              idempotencyKey: `cash-refund:${dispute.bookingId}:DEPOSIT`,
              type: "CASH_REFUND_DEDUCTION",
              balanceType: "DEPOSIT",
              amount: -depositDebit,
              balanceAfter: updatedProvider.depositBalance,
              note: "Cash booking refund after customer won dispute",
            },
          });
        }
      }

      return updatedDispute;
    });

    if (shouldProcessCommission(status)) {
      await bookingFinanceService.processCompletedBookingCommission(
        dispute.bookingId,
      );
    }

    if (status === "RESOLVED_CUSTOMER_WIN") {
      await commissionRecordService.releaseForBooking(
        dispute.bookingId,
        "Dispute resolved in customer favor",
      );
    }

    const freshDispute = await prisma.booking_disputes.findUnique({
      where: { id: resolvedDispute.id },
      include: DISPUTE_INCLUDE,
    });

    const [customer, provider] = await Promise.all([
      prisma.customers.findUnique({
        where: { id: dispute.customerId },
        select: { userId: true },
      }),
      prisma.providers.findUnique({
        where: { id: dispute.providerId },
        select: { userId: true },
      }),
    ]);

    await notificationService.safeCreateMany([
      ...(customer
        ? [
            {
              userId: customer.userId,
              type: "DISPUTE_RESOLVED",
              title: "Dispute resolved",
              message: `Your dispute was resolved as ${status}.`,
              data: { bookingId: dispute.bookingId, disputeId: dispute.id, status },
            },
            ...(shouldRefund
              ? [
                  {
                    userId: customer.userId,
                    type: "REFUND_PENDING",
                    title: "Refund pending",
                    message:
                      "Your dispute was resolved in your favor. The refund is waiting for manual processing.",
                    data: {
                      bookingId: dispute.bookingId,
                      disputeId: dispute.id,
                      refundAmount: dispute.booking.totalAmount,
                      refundSource:
                        dispute.booking.paymentMethod === "CASH"
                          ? "PROVIDER_WALLET_DEPOSIT"
                          : "ONLINE_PAYMENT",
                    },
                  },
                ]
              : []),
          ]
        : []),
      ...(provider
        ? [
            {
              userId: provider.userId,
              type: "DISPUTE_RESOLVED",
              title: "Dispute resolved",
              message: `A booking dispute was resolved as ${status}.`,
              data: { bookingId: dispute.bookingId, disputeId: dispute.id, status },
            },
          ]
        : []),
    ]);

    await adminAuditLogService.safeLog({
      adminId,
      action: "DISPUTE_RESOLVE",
      targetType: "DISPUTE",
      targetId: dispute.id,
      metadata: {
        bookingId: dispute.bookingId,
        customerId: dispute.customerId,
        providerId: dispute.providerId,
        status,
        bookingStatus:
          status === "RESOLVED_CUSTOMER_WIN" ? "CANCELLED" : "COMPLETED",
        paymentStatus: shouldRefund ? "REFUND_PENDING" : dispute.booking.paymentStatus,
        refundAmount: shouldRefund ? dispute.booking.totalAmount : null,
        refundSource:
          shouldRefund && dispute.booking.paymentMethod === "CASH"
            ? "PROVIDER_WALLET_DEPOSIT"
            : shouldRefund
              ? "ONLINE_PAYMENT"
              : null,
        adminEvidence,
      },
    });

    return mapDispute(freshDispute ?? resolvedDispute);
  },
};
