import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../connect.prisma.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import {
  BadRequestException,
  NotFoundException,
} from "../common/helpers/exception.helper.ts";
import { getSystemSettingValue } from "./system-setting.service.ts";

const COMMISSION_STATUSES = ["PENDING", "CHARGED", "RELEASED", "FAILED"] as const;
const COMMISSION_PAYMENT_METHODS = ["CASH", "ONLINE"] as const;

type CommissionStatus = (typeof COMMISSION_STATUSES)[number];
type CommissionPaymentMethod = (typeof COMMISSION_PAYMENT_METHODS)[number];

type BookingCommissionInput = {
  id: string;
  providerId: string;
  customerId: string;
  serviceId: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus?: string | null;
};

function getOptionalObjectId(value: unknown, name: string) {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestException(`${name} must be a valid ObjectId`);
  }

  return value;
}

function getOptionalStatus(value: unknown): CommissionStatus | undefined {
  if (value === undefined || value === "") return undefined;
  if (
    typeof value !== "string" ||
    !COMMISSION_STATUSES.includes(value as CommissionStatus)
  ) {
    throw new BadRequestException(
      `status must be one of: ${COMMISSION_STATUSES.join(", ")}`,
    );
  }

  return value as CommissionStatus;
}

function getOptionalPaymentMethod(value: unknown): CommissionPaymentMethod | undefined {
  if (value === undefined || value === "") return undefined;
  if (
    typeof value !== "string" ||
    !COMMISSION_PAYMENT_METHODS.includes(value as CommissionPaymentMethod)
  ) {
    throw new BadRequestException(
      `paymentMethod must be one of: ${COMMISSION_PAYMENT_METHODS.join(", ")}`,
    );
  }

  return value as CommissionPaymentMethod;
}

function getDate(value: unknown, name: string) {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string") {
    throw new BadRequestException(`${name} must be a valid date`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${name} must be a valid date`);
  }

  return date;
}

function calculateCommission(totalAmount: number, commissionRate: number) {
  const commissionAmount = Math.round(totalAmount * commissionRate);
  const providerEarning = totalAmount - commissionAmount;

  return { commissionAmount, providerEarning };
}

function rateLabel(rate: number) {
  return `${Math.round(rate * 10000) / 100}%`;
}

function getFundSnapshot(booking: BookingCommissionInput) {
  if (booking.paymentMethod !== "ONLINE") {
    return {
      heldAmount: 0,
      fundSource: "CUSTOMER_CASH_TO_PROVIDER",
      fundStatus: "NOT_HELD",
    };
  }

  if (booking.paymentStatus === "SUCCESS") {
    return {
      heldAmount: booking.totalAmount,
      fundSource: "CUSTOMER_ONLINE_PAYMENT",
      fundStatus: "HELD",
    };
  }

  if (booking.paymentStatus === "REFUND_PENDING") {
    return {
      heldAmount: booking.totalAmount,
      fundSource: "CUSTOMER_ONLINE_PAYMENT",
      fundStatus: "REFUND_PENDING",
    };
  }

  if (booking.paymentStatus === "REFUNDED") {
    return {
      heldAmount: 0,
      fundSource: "CUSTOMER_ONLINE_PAYMENT",
      fundStatus: "REFUNDED",
    };
  }

  return {
    heldAmount: 0,
    fundSource: "CUSTOMER_ONLINE_PAYMENT",
    fundStatus: "NOT_HELD",
  };
}

function toCommissionDto(record: any) {
  const displayStatus = (() => {
    if (record.status !== "RELEASED") return record.status;
    if (record.fundStatus === "REFUND_PENDING") return "REFUND_PENDING";
    if (record.fundStatus === "REFUNDED") return "REFUNDED";
    return "CANCELLED";
  })();

  return {
    id: record.id,
    bookingId: record.bookingId,
    providerId: record.providerId,
    providerName: record.provider?.businessName ?? "Unknown provider",
    serviceName: record.booking?.service?.name ?? "Unknown service",
    bookingAmount: record.bookingAmount,
    heldAmount: record.heldAmount ?? 0,
    commissionAmount: record.commissionAmount,
    providerEarning: record.providerEarning,
    rateLabel: rateLabel(record.commissionRate),
    status: record.status,
    displayStatus,
    fundSource: record.fundSource ?? "NONE",
    fundStatus: record.fundStatus ?? "NOT_HELD",
    paymentMethod: record.paymentMethod === "ONLINE" ? "MOMO" : record.paymentMethod,
    reservedAt: record.reservedAt?.toISOString?.() ?? null,
    chargedAt: record.chargedAt?.toISOString?.() ?? null,
    releasedAt: record.releasedAt?.toISOString?.() ?? null,
    failedAt: record.failedAt?.toISOString?.() ?? null,
    collectedFrom: record.collectedFrom ?? null,
    failureReason: record.failureReason ?? null,
    releaseReason: record.releaseReason ?? null,
  };
}

async function getCommissionData(booking: BookingCommissionInput) {
  const commissionRate = await getSystemSettingValue("platformCommissionRate");
  return {
    commissionRate,
    ...calculateCommission(booking.totalAmount, commissionRate),
  };
}

async function reconcileRefundedCommissionRecords() {
  await prisma.commission_records.updateMany({
    where: {
      status: { in: ["PENDING", "FAILED"] },
      fundStatus: "REFUNDED",
    },
    data: {
      status: "RELEASED",
      releaseReason: "Customer refund completed",
      releasedAt: new Date(),
    },
  });
}

export const commissionRecordService = {
  async holdForBooking(booking: BookingCommissionInput) {
    const data = await getCommissionData(booking);
    const fund = getFundSnapshot(booking);

    return prisma.commission_records.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        providerId: booking.providerId,
        customerId: booking.customerId,
        serviceId: booking.serviceId,
        bookingAmount: booking.totalAmount,
        heldAmount: fund.heldAmount,
        commissionRate: data.commissionRate,
        commissionAmount: data.commissionAmount,
        providerEarning: data.providerEarning,
        paymentMethod: booking.paymentMethod,
        fundSource: fund.fundSource,
        fundStatus: fund.fundStatus,
        status: "PENDING",
        reservedAt: new Date(),
      },
      update: {
        bookingAmount: booking.totalAmount,
        heldAmount: fund.heldAmount,
        commissionRate: data.commissionRate,
        commissionAmount: data.commissionAmount,
        providerEarning: data.providerEarning,
        paymentMethod: booking.paymentMethod,
        fundSource: fund.fundSource,
        fundStatus: fund.fundStatus,
        status: "PENDING",
        failureReason: null,
        releaseReason: null,
      },
    });
  },

  async chargeForBooking(
    booking: BookingCommissionInput,
    input: {
      commissionAmount: number;
      providerEarning: number;
      collectedFrom: string;
      chargedAt?: Date;
    },
  ) {
    const commissionRate =
      booking.totalAmount > 0 ? input.commissionAmount / booking.totalAmount : 0;
    const fundSource =
      booking.paymentMethod === "ONLINE"
        ? "CUSTOMER_ONLINE_PAYMENT"
        : "CUSTOMER_CASH_TO_PROVIDER";
    const fundStatus =
      booking.paymentMethod === "ONLINE" ? "SETTLED_TO_PROVIDER" : "NOT_HELD";

    return prisma.commission_records.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        providerId: booking.providerId,
        customerId: booking.customerId,
        serviceId: booking.serviceId,
        bookingAmount: booking.totalAmount,
        heldAmount: 0,
        commissionRate,
        commissionAmount: input.commissionAmount,
        providerEarning: input.providerEarning,
        paymentMethod: booking.paymentMethod,
        fundSource,
        fundStatus,
        status: "CHARGED",
        collectedFrom: input.collectedFrom,
        reservedAt: input.chargedAt ?? new Date(),
        chargedAt: input.chargedAt ?? new Date(),
      },
      update: {
        bookingAmount: booking.totalAmount,
        heldAmount: 0,
        commissionRate,
        commissionAmount: input.commissionAmount,
        providerEarning: input.providerEarning,
        paymentMethod: booking.paymentMethod,
        fundSource,
        fundStatus,
        status: "CHARGED",
        collectedFrom: input.collectedFrom,
        chargedAt: input.chargedAt ?? new Date(),
        failureReason: null,
      },
    });
  },

  async releaseForBooking(bookingId: string, reason: string) {
    const record = await prisma.commission_records.findUnique({
      where: { bookingId },
      select: { heldAmount: true },
    });
    const data: {
      status: string;
      fundStatus?: string;
      releaseReason: string;
      releasedAt: Date;
    } = {
      status: "RELEASED",
      releaseReason: reason,
      releasedAt: new Date(),
    };

    if ((record?.heldAmount ?? 0) > 0) {
      data.fundStatus = "REFUND_PENDING";
    }

    return prisma.commission_records.updateMany({
      where: {
        bookingId,
        status: { in: ["PENDING", "FAILED"] },
      },
      data,
    });
  },

  async markHeldRefundedForBooking(bookingId: string) {
    return prisma.commission_records.updateMany({
      where: {
        bookingId,
        status: { not: "CHARGED" },
      },
      data: {
        status: "RELEASED",
        heldAmount: 0,
        fundStatus: "REFUNDED",
        releaseReason: "Customer refund completed",
        releasedAt: new Date(),
      },
    });
  },

  async failForBooking(bookingId: string, reason: string) {
    return prisma.commission_records.updateMany({
      where: {
        bookingId,
        status: { not: "CHARGED" },
      },
      data: {
        status: "FAILED",
        failureReason: reason,
        failedAt: new Date(),
      },
    });
  },

  async getSummary() {
    await reconcileRefundedCommissionRecords();

    const [
      held,
      pending,
      charged,
      refundPending,
      refunded,
      releasedWithoutRefund,
      failed,
      cash,
      online,
    ] = await Promise.all([
      prisma.commission_records.aggregate({
        where: { heldAmount: { gt: 0 } },
        _sum: { heldAmount: true },
      }),
      prisma.commission_records.aggregate({
        where: { status: "PENDING" },
        _sum: { commissionAmount: true },
      }),
      prisma.commission_records.aggregate({
        where: { status: "CHARGED" },
        _sum: { commissionAmount: true },
      }),
      prisma.commission_records.aggregate({
        where: {
          status: "RELEASED",
          fundStatus: "REFUND_PENDING",
        },
        _sum: { heldAmount: true, commissionAmount: true },
      }),
      prisma.commission_records.aggregate({
        where: {
          status: "RELEASED",
          fundStatus: "REFUNDED",
        },
        _sum: { commissionAmount: true },
      }),
      prisma.commission_records.aggregate({
        where: {
          status: "RELEASED",
          fundStatus: { notIn: ["REFUND_PENDING", "REFUNDED"] },
        },
        _sum: { commissionAmount: true },
      }),
      prisma.commission_records.aggregate({
        where: { status: "FAILED" },
        _sum: { commissionAmount: true },
      }),
      prisma.commission_records.aggregate({
        where: { paymentMethod: "CASH", status: "CHARGED" },
        _sum: { commissionAmount: true },
      }),
      prisma.commission_records.aggregate({
        where: { paymentMethod: "ONLINE", status: "CHARGED" },
        _sum: { commissionAmount: true },
      }),
    ]);

    return {
      heldAmount: held._sum.heldAmount ?? 0,
      pendingHeldAmount: held._sum.heldAmount ?? 0,
      pendingCommissionAmount: pending._sum.commissionAmount ?? 0,
      refundPendingAmount: refundPending._sum.heldAmount ?? 0,
      refundPendingCommissionAmount:
        refundPending._sum.commissionAmount ?? 0,
      reservedAmount: held._sum.heldAmount ?? 0,
      chargedAmount: charged._sum.commissionAmount ?? 0,
      chargedCommissionAmount: charged._sum.commissionAmount ?? 0,
      releasedAmount:
        refunded._sum.commissionAmount ?? 0,
      releasedCommissionAmount: refunded._sum.commissionAmount ?? 0,
      refundedCommissionAmount: refunded._sum.commissionAmount ?? 0,
      releasedWithoutRefundCommissionAmount:
        releasedWithoutRefund._sum.commissionAmount ?? 0,
      cancelledCommissionAmount:
        releasedWithoutRefund._sum.commissionAmount ?? 0,
      failedAmount: failed._sum.commissionAmount ?? 0,
      failedCommissionAmount: failed._sum.commissionAmount ?? 0,
      cashCommissionAmount: cash._sum.commissionAmount ?? 0,
      onlineCommissionAmount: online._sum.commissionAmount ?? 0,
    };
  },

  async getAll(req: Request) {
    await reconcileRefundedCommissionRecords();

    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    const providerId = getOptionalObjectId(req.query.providerId, "providerId");
    const bookingId = getOptionalObjectId(req.query.bookingId, "bookingId");
    const status = getOptionalStatus(req.query.status);
    const paymentMethod = getOptionalPaymentMethod(req.query.paymentMethod);
    const from = getDate(req.query.from, "from");
    const to = getDate(req.query.to, "to");

    if (providerId) where.providerId = providerId;
    if (bookingId) where.bookingId = bookingId;
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (from || to) {
      where.reservedAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const [totalItems, records] = await Promise.all([
      prisma.commission_records.count({ where }),
      prisma.commission_records.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: { reservedAt: "desc" },
        include: {
          provider: { select: { id: true, businessName: true } },
          booking: {
            select: {
              id: true,
              status: true,
              paymentStatus: true,
              service: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items: records.map(toCommissionDto),
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

  async getPending(req: Request) {
    req.query.status = "PENDING";
    return this.getAll(req);
  },

  async getById(req: Request) {
    const id = req.params.id;
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid commission id");
    }

    const record = await prisma.commission_records.findUnique({
      where: { id },
      include: {
        provider: { select: { id: true, businessName: true } },
        booking: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            service: { select: { id: true, name: true } },
            walletTransactions: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException("Commission record not found");
    }

    return {
      ...toCommissionDto(record),
      booking: record.booking,
    };
  },
};
