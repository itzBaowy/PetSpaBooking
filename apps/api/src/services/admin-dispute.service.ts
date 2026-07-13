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
import { notificationService } from "./notification.service.ts";
import { adminAuditLogService } from "./admin-audit-log.service.ts";

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

const DISPUTE_INCLUDE = {
  booking: {
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      totalAmount: true,
      checkedOutAt: true,
      completedAt: true,
      cancelledAt: true,
      commissionProcessedAt: true,
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

  if (
    booking.paymentMethod !== "ONLINE" ||
    booking.paymentStatus !== "SUCCESS"
  ) {
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

function shouldCreateRefundPendingNotification(
  status: ResolutionStatus,
  booking: {
    paymentMethod: string;
    paymentStatus: string;
  },
) {
  return (
    status === "RESOLVED_CUSTOMER_WIN" &&
    booking.paymentMethod === "ONLINE" &&
    booking.paymentStatus === "SUCCESS"
  );
}

function mapDispute(dispute: {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  reason: string;
  description: string | null;
  status: string;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  adminNote: string | null;
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
    status: dispute.status,
    resolvedBy: dispute.resolvedBy,
    resolvedAt: dispute.resolvedAt,
    adminNote: dispute.adminNote,
    createdAt: dispute.createAt,
    updatedAt: dispute.updateAt,
    booking: dispute.booking,
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

    const resolvedDispute = await prisma.$transaction(async (tx) => {
      const updatedDispute = await tx.booking_disputes.update({
        where: { id: dispute.id },
        data: {
          status,
          resolvedBy: adminId,
          resolvedAt: now,
          adminNote,
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

      return updatedDispute;
    });

    if (shouldProcessCommission(status)) {
      await bookingFinanceService.processCompletedBookingCommission(
        dispute.bookingId,
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

    const shouldRefund = shouldCreateRefundPendingNotification(
      status,
      dispute.booking,
    );

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
      },
    });

    return mapDispute(freshDispute ?? resolvedDispute);
  },
};
