import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../connect.prisma.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import {
  BadRequestException,
  NotFoundException,
} from "../common/helpers/exception.helper.ts";
import { autoCompleteCheckedOutBookings } from "../jobs/booking-auto-complete.job.ts";
import { getBookingAutoCompleteHours } from "./mobile-services/booking.service.ts";

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

const PAYMENT_METHODS = ["CASH", "ONLINE"] as const;
const PAYMENT_STATUSES = [
  "UNPAID",
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUND_PENDING",
  "REFUNDED",
  "CANCELLED",
] as const;

type BookingStatus = (typeof BOOKING_STATUSES)[number];
type PaymentMethod = (typeof PAYMENT_METHODS)[number];
type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const ADMIN_BOOKING_BASE_INCLUDE = {
  provider: {
    select: {
      id: true,
      businessName: true,
      providerStatus: true,
      depositStatus: true,
      depositBalance: true,
      walletBalance: true,
    },
  },
  customer: {
    select: {
      id: true,
      location: true,
      users: {
        select: {
          id: true,
          userName: true,
          fullName: true,
          phone: true,
          email: true,
          status: true,
        },
      },
    },
  },
  service: {
    select: {
      id: true,
      name: true,
      price: true,
      duration: true,
      category: true,
      isActive: true,
      isHiddenByAdmin: true,
    },
  },
  dispute: {
    select: {
      id: true,
      status: true,
      reason: true,
      description: true,
      resolvedAt: true,
      adminNote: true,
    },
  },
  review: {
    select: {
      id: true,
      rating: true,
      comment: true,
      createAt: true,
    },
  },
} as const;

const ADMIN_BOOKING_LIST_INCLUDE = {
  ...ADMIN_BOOKING_BASE_INCLUDE,
  _count: {
    select: {
      walletTransactions: true,
    },
  },
} as const;

const ADMIN_BOOKING_DETAIL_INCLUDE = {
  ...ADMIN_BOOKING_BASE_INCLUDE,
  walletTransactions: {
    orderBy: { createAt: "desc" },
  },
} as const;

function getRouteParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestException(`Invalid route parameter: ${name}`);
  }

  return value;
}

function getEnumQuery<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  name: string,
): T[number] | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new BadRequestException(`${name} must be one of: ${allowed.join(", ")}`);
  }

  return value as T[number];
}

function getObjectIdQuery(value: unknown, name: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new BadRequestException(`${name} must be a valid ObjectId`);
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) return undefined;
  if (!ObjectId.isValid(normalizedValue)) {
    throw new BadRequestException(`${name} must be a valid ObjectId`);
  }

  return normalizedValue;
}

function getObjectIdPrefixQuery(value: unknown, name: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new BadRequestException(`${name} must contain only ObjectId characters`);
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) return undefined;
  if (!/^[0-9a-fA-F]{1,24}$/.test(normalizedValue)) {
    throw new BadRequestException(`${name} must contain only ObjectId characters`);
  }

  const lower = normalizedValue.toLowerCase().padEnd(24, "0");
  const upper = normalizedValue.toLowerCase().padEnd(24, "f");

  return normalizedValue.length === 24
    ? normalizedValue
    : { gte: lower, lte: upper };
}

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

export const adminBookingService = {
  async runAutoCompleteScan() {
    const completedCount = await autoCompleteCheckedOutBookings();

    return {
      completedCount,
      holdHours: getBookingAutoCompleteHours(),
    };
  },

  async getAll(req: Request) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    const status = getEnumQuery(req.query.status, BOOKING_STATUSES, "status");
    const paymentMethod = getEnumQuery(
      req.query.paymentMethod,
      PAYMENT_METHODS,
      "paymentMethod",
    ) as PaymentMethod | undefined;
    const paymentStatus = getEnumQuery(
      req.query.paymentStatus,
      PAYMENT_STATUSES,
      "paymentStatus",
    ) as PaymentStatus | undefined;
    const bookingId = getObjectIdPrefixQuery(req.query.bookingId, "bookingId");
    const providerId = getObjectIdQuery(req.query.providerId, "providerId");
    const customerId = getObjectIdQuery(req.query.customerId, "customerId");
    const from = getDateQuery(req.query.from, "from");
    const to = getDateQuery(req.query.to, "to");

    if (bookingId) where.id = bookingId;
    if (status) where.status = status as BookingStatus;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (providerId) where.providerId = providerId;
    if (customerId) where.customerId = customerId;
    if (from || to) {
      where.appointmentStart = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const [totalItems, items] = await Promise.all([
      prisma.bookings.count({ where }),
      prisma.bookings.findMany({
        where,
        include: ADMIN_BOOKING_LIST_INCLUDE,
        skip: index,
        take: pageSize,
        orderBy: { appointmentStart: "desc" },
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

  async getById(req: Request) {
    const id = getRouteParam(req, "id");
    const booking = await prisma.bookings.findUnique({
      where: { id },
      include: ADMIN_BOOKING_DETAIL_INCLUDE,
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  },
};
