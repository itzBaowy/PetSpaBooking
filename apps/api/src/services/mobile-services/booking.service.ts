import { Request } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import prisma from "../../../connect.prisma.ts";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/helpers/exception.helper.ts";
import { buildQueryPrisma } from "../../common/helpers/build-query-prisma.helper.ts";
import { notificationService } from "../notification.service.ts";

const VALID_PAYMENT_METHODS = ["CASH", "ONLINE"] as const;
const VALID_BOOKING_STATUSES = [
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
const MIN_PROVIDER_DEPOSIT = 300_000;
const QR_TOKEN_EXPIRES_IN_SECONDS = 10 * 60;
const VALID_QR_ACTIONS = ["CHECK_IN", "CHECK_OUT"] as const;

type PaymentMethod = (typeof VALID_PAYMENT_METHODS)[number];
type BookingStatus = (typeof VALID_BOOKING_STATUSES)[number];
type QrAction = (typeof VALID_QR_ACTIONS)[number];

type BookingQrPayload = jwt.JwtPayload & {
  type: "BOOKING_QR";
  bookingId: string;
  customerId: string;
  providerId: string;
  action: QrAction;
};

const BOOKING_INCLUDE = {
  service: {
    select: {
      id: true,
      name: true,
      price: true,
      duration: true,
      category: true,
      imageUrls: true,
    },
  },
  provider: {
    select: {
      id: true,
      businessName: true,
      slug: true,
      avatarUrl: true,
      address: true,
      ward: true,
      district: true,
      province: true,
      phone: true,
    },
  },
  customer: {
    select: {
      id: true,
      location: true,
      users: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          avatar: true,
        },
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
  if (typeof value !== "string" || !value || !ObjectId.isValid(value)) {
    throw new BadRequestException(`Invalid route parameter: ${name}`);
  }

  return value;
}

function parseAppointmentStart(value: unknown): Date {
  if (typeof value !== "string" || !value) {
    throw new BadRequestException("appointmentStart is required");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException("appointmentStart must be a valid date");
  }

  if (date.getTime() <= Date.now()) {
    throw new BadRequestException("appointmentStart must be in the future");
  }

  return date;
}

function getQrAction(value: unknown): QrAction {
  if (!VALID_QR_ACTIONS.includes(value as QrAction)) {
    throw new BadRequestException(
      `action must be one of: ${VALID_QR_ACTIONS.join(", ")}`,
    );
  }

  return value as QrAction;
}

function getQrToken(req: Request): string {
  const { qrToken } = req.body as { qrToken?: unknown };
  if (typeof qrToken !== "string" || !qrToken) {
    throw new BadRequestException("qrToken is required");
  }

  return qrToken;
}

function signBookingQrToken(payload: Omit<BookingQrPayload, keyof jwt.JwtPayload>) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: QR_TOKEN_EXPIRES_IN_SECONDS,
  });
}

function verifyBookingQrToken(token: string): BookingQrPayload {
  const payload = jwt.verify(token, process.env.JWT_SECRET as string);

  if (
    typeof payload !== "object" ||
    payload === null ||
    payload.type !== "BOOKING_QR" ||
    typeof payload.bookingId !== "string" ||
    typeof payload.customerId !== "string" ||
    typeof payload.providerId !== "string" ||
    !VALID_QR_ACTIONS.includes(payload.action as QrAction)
  ) {
    throw new BadRequestException("Invalid booking QR token payload");
  }

  return payload as BookingQrPayload;
}

export function getBookingAutoCompleteHours(): number {
  const value = Number(process.env.BOOKING_AUTO_COMPLETE_HOURS);
  return Number.isFinite(value) && value > 0 ? value : 10;
}

function getBookingDisputeDeadline(checkedOutAt: Date): Date {
  return new Date(
    checkedOutAt.getTime() + getBookingAutoCompleteHours() * 60 * 60 * 1000,
  );
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function parseReviewImages(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new BadRequestException("images must be an array of strings");
  }

  return value;
}

async function getOrCreateCustomer(userId: string, location?: string) {
  const existing = await prisma.customers.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.customers.create({
    data: {
      userId,
      location: location ?? "",
    },
  });
}

async function getOperatingProviderByUserId(userId: string) {
  const provider = await prisma.providers.findUnique({ where: { userId } });

  if (!provider) {
    throw new ForbiddenException("Provider profile not found");
  }

  if (provider.providerStatus !== "VERIFIED") {
    throw new ForbiddenException(
      `Provider is not verified yet (status: ${provider.providerStatus}).`,
    );
  }

  if (
    provider.depositStatus !== "ACTIVE" ||
    provider.depositBalance < MIN_PROVIDER_DEPOSIT
  ) {
    throw new ForbiddenException(
      `Provider deposit must be ACTIVE and at least ${MIN_PROVIDER_DEPOSIT} VND.`,
    );
  }

  return provider;
}

export const mobileBookingServices = {
  async create(req: Request) {
    const userId = getRequesterId(req);
    const {
      providerId,
      serviceId,
      petId,
      appointmentStart,
      paymentMethod = "CASH",
      note,
      customerLocation,
    } = req.body as {
      providerId?: string;
      serviceId?: string;
      petId?: string;
      appointmentStart?: string;
      paymentMethod?: string;
      note?: string;
      customerLocation?: string;
    };

    if (!providerId || !ObjectId.isValid(providerId)) {
      throw new BadRequestException("Valid providerId is required");
    }

    if (!serviceId || !ObjectId.isValid(serviceId)) {
      throw new BadRequestException("Valid serviceId is required");
    }

    if (petId && !ObjectId.isValid(petId)) {
      throw new BadRequestException("Invalid petId");
    }

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
      throw new BadRequestException(
        `paymentMethod must be one of: ${VALID_PAYMENT_METHODS.join(", ")}`,
      );
    }

    const start = parseAppointmentStart(appointmentStart);
    const customer = await getOrCreateCustomer(userId, customerLocation);

    if (petId) {
      const pet = await prisma.pets.findUnique({ where: { id: petId } });
      if (!pet || pet.customerId !== customer.id) {
        throw new ForbiddenException("Pet does not belong to this customer");
      }
    }

    const service = await prisma.services.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    });

    if (!service || service.providerId !== providerId) {
      throw new NotFoundException("Service not found for this provider");
    }

    if (!service.isActive || service.isHiddenByAdmin) {
      throw new BadRequestException("Service is not available for booking");
    }

    const provider = service.provider;
    if (provider.providerStatus !== "VERIFIED") {
      throw new BadRequestException("Provider is not available for booking");
    }

    if (
      provider.depositStatus !== "ACTIVE" ||
      provider.depositBalance < MIN_PROVIDER_DEPOSIT
    ) {
      throw new BadRequestException("Provider is not accepting bookings yet");
    }

    if (paymentMethod === "CASH" && !provider.payCash) {
      throw new BadRequestException("Provider does not accept cash payment");
    }

    if (paymentMethod === "ONLINE" && !provider.payOnline) {
      throw new BadRequestException("Provider does not accept online payment");
    }

    const end = new Date(start.getTime() + service.duration * 60_000);

    return prisma.bookings.create({
      data: {
        customerId: customer.id,
        providerId,
        serviceId,
        petId: petId ?? null,
        appointmentStart: start,
        appointmentEnd: end,
        paymentMethod,
        paymentStatus: paymentMethod === "CASH" ? "UNPAID" : "PENDING",
        status: "PENDING",
        totalAmount: service.price,
        currency: "VND",
        note: note ?? null,
      },
      include: BOOKING_INCLUDE,
    });
  },

  async getMyBookings(req: Request) {
    const userId = getRequesterId(req);
    const customer = await prisma.customers.findUnique({ where: { userId } });

    if (!customer) {
      return {
        items: [],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );
    where.customerId = customer.id;

    if (
      req.query.status &&
      VALID_BOOKING_STATUSES.includes(req.query.status as BookingStatus)
    ) {
      where.status = req.query.status;
    }

    const [totalItems, items] = await Promise.all([
      prisma.bookings.count({ where }),
      prisma.bookings.findMany({
        where,
        include: BOOKING_INCLUDE,
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

  async getMyBookingById(req: Request) {
    const userId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const customer = await prisma.customers.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException("Booking not found");

    const booking = await prisma.bookings.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    });

    if (!booking || booking.customerId !== customer.id) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  },

  async getMyBookingQr(req: Request) {
    const userId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const action = getQrAction(req.query.action);
    const customer = await prisma.customers.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException("Booking not found");

    const booking = await prisma.bookings.findUnique({ where: { id } });
    if (!booking || booking.customerId !== customer.id) {
      throw new NotFoundException("Booking not found");
    }

    if (action === "CHECK_IN" && booking.status !== "CONFIRMED") {
      throw new BadRequestException(
        "CHECK_IN QR is only available for CONFIRMED bookings",
      );
    }

    if (action === "CHECK_OUT" && booking.status !== "CHECKED_IN") {
      throw new BadRequestException(
        "CHECK_OUT QR is only available for CHECKED_IN bookings",
      );
    }

    const qrToken = signBookingQrToken({
      type: "BOOKING_QR",
      bookingId: booking.id,
      customerId: booking.customerId,
      providerId: booking.providerId,
      action,
    });

    return {
      bookingId: booking.id,
      action,
      qrToken,
      expiresInSeconds: QR_TOKEN_EXPIRES_IN_SECONDS,
    };
  },

  async createDispute(req: Request) {
    const userId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const { reason, description } = req.body as {
      reason?: unknown;
      description?: unknown;
    };

    if (typeof reason !== "string" || !reason.trim()) {
      throw new BadRequestException("reason is required");
    }

    if (
      description !== undefined &&
      (typeof description !== "string" || !description.trim())
    ) {
      throw new BadRequestException("description must be a non-empty string");
    }

    const customer = await prisma.customers.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException("Booking not found");

    const booking = await prisma.bookings.findUnique({ where: { id } });
    if (!booking || booking.customerId !== customer.id) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status !== "CHECKED_OUT" || !booking.checkedOutAt) {
      throw new BadRequestException(
        "Only CHECKED_OUT bookings can be disputed",
      );
    }

    if (Date.now() > getBookingDisputeDeadline(booking.checkedOutAt).getTime()) {
      throw new BadRequestException("Dispute window has expired");
    }

    const existingDispute = await prisma.booking_disputes.findUnique({
      where: {
        bookingId: booking.id,
      },
    });

    if (existingDispute) {
      throw new BadRequestException("This booking already has a dispute");
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const dispute = await tx.booking_disputes.create({
          data: {
            bookingId: booking.id,
            customerId: booking.customerId,
            providerId: booking.providerId,
            reason: reason.trim(),
            description:
              typeof description === "string" ? description.trim() : null,
            status: "PENDING",
          },
        });

        await tx.bookings.update({
          where: { id: booking.id },
          data: { status: "DISPUTE" },
        });

        return {
          id: dispute.id,
          bookingId: dispute.bookingId,
          reason: dispute.reason,
          description: dispute.description,
          status: dispute.status,
          createdAt: dispute.createAt,
        };
      });

      const [providerProfile, admins] = await Promise.all([
        prisma.providers.findUnique({
          where: { id: booking.providerId },
          select: { userId: true, businessName: true },
        }),
        prisma.users.findMany({
          where: { role: "ADMIN" },
          select: { id: true },
        }),
      ]);

      await notificationService.safeCreateMany([
        ...(providerProfile
          ? [
              {
                userId: providerProfile.userId,
                type: "DISPUTE_CREATED",
                title: "New dispute",
                message: "A customer created a dispute for a booking.",
                data: { bookingId: booking.id, disputeId: result.id },
              },
            ]
          : []),
        ...admins.map((admin) => ({
          userId: admin.id,
          type: "DISPUTE_CREATED",
          title: "New dispute",
          message: "A new booking dispute needs review.",
          data: { bookingId: booking.id, disputeId: result.id },
        })),
      ]);

      return result;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new BadRequestException("This booking already has a dispute");
      }

      throw error;
    }
  },

  async createReview(req: Request) {
    const userId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const { rating, comment, images } = req.body as {
      rating?: unknown;
      comment?: unknown;
      images?: unknown;
    };

    if (typeof rating !== "number" || !Number.isInteger(rating)) {
      throw new BadRequestException("rating must be an integer");
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException("rating must be between 1 and 5");
    }

    if (comment !== undefined && typeof comment !== "string") {
      throw new BadRequestException("comment must be a string");
    }

    const resolvedImages = parseReviewImages(images);
    const customer = await prisma.customers.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException("Booking not found");

    const booking = await prisma.bookings.findUnique({
      where: { id },
      include: { review: true },
    });

    if (!booking || booking.customerId !== customer.id) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status !== "COMPLETED") {
      throw new BadRequestException("Only COMPLETED bookings can be reviewed");
    }

    if (booking.review) {
      throw new BadRequestException("This booking has already been reviewed");
    }

    return prisma.reviews.create({
      data: {
        bookingId: booking.id,
        providerId: booking.providerId,
        customerId: booking.customerId,
        rating,
        comment: typeof comment === "string" ? comment : null,
        images: resolvedImages,
      },
      include: {
        customers: {
          include: {
            users: true,
          },
        },
      },
    });
  },

  async getProviderBookings(req: Request) {
    const userId = getRequesterId(req);
    const provider = await getOperatingProviderByUserId(userId);
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );
    where.providerId = provider.id;

    if (
      req.query.status &&
      VALID_BOOKING_STATUSES.includes(req.query.status as BookingStatus)
    ) {
      where.status = req.query.status;
    }

    const [totalItems, items] = await Promise.all([
      prisma.bookings.count({ where }),
      prisma.bookings.findMany({
        where,
        include: BOOKING_INCLUDE,
        skip: index,
        take: pageSize,
        orderBy: { appointmentStart: "asc" },
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

  async confirm(req: Request) {
    const userId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const provider = await getOperatingProviderByUserId(userId);

    const booking = await prisma.bookings.findUnique({ where: { id } });
    if (!booking || booking.providerId !== provider.id) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status !== "PENDING") {
      throw new BadRequestException("Only PENDING bookings can be confirmed");
    }

    const updatedBooking = await prisma.bookings.update({
      where: { id },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
      include: BOOKING_INCLUDE,
    });

    await notificationService.safeCreate({
      userId: updatedBooking.customer.users.id,
      type: "BOOKING_CONFIRMED",
      title: "Booking confirmed",
      message: `${updatedBooking.provider.businessName} confirmed your booking.`,
      data: { bookingId: updatedBooking.id },
    });

    return updatedBooking;
  },

  async reject(req: Request) {
    const userId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const provider = await getOperatingProviderByUserId(userId);
    const { reason } = req.body as { reason?: string };

    const booking = await prisma.bookings.findUnique({ where: { id } });
    if (!booking || booking.providerId !== provider.id) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status !== "PENDING") {
      throw new BadRequestException("Only PENDING bookings can be rejected");
    }

    const updatedBooking = await prisma.bookings.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectReason: reason ?? null,
        rejectedAt: new Date(),
      },
      include: BOOKING_INCLUDE,
    });

    await notificationService.safeCreate({
      userId: updatedBooking.customer.users.id,
      type: "BOOKING_REJECTED",
      title: "Booking rejected",
      message: `${updatedBooking.provider.businessName} rejected your booking.`,
      data: { bookingId: updatedBooking.id, reason: reason ?? null },
    });

    return updatedBooking;
  },

  async checkIn(req: Request) {
    const userId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const provider = await getOperatingProviderByUserId(userId);
    const qrPayload = verifyBookingQrToken(getQrToken(req));

    const booking = await prisma.bookings.findUnique({ where: { id } });
    if (!booking || booking.providerId !== provider.id) {
      throw new NotFoundException("Booking not found");
    }

    if (
      qrPayload.bookingId !== booking.id ||
      qrPayload.customerId !== booking.customerId ||
      qrPayload.providerId !== booking.providerId ||
      qrPayload.action !== "CHECK_IN"
    ) {
      throw new BadRequestException("QR token does not match this booking");
    }

    if (booking.status !== "CONFIRMED") {
      throw new BadRequestException("Only CONFIRMED bookings can be checked in");
    }

    const now = new Date();

    const updatedBooking = await prisma.$transaction(async (tx) => {
      await tx.booking_qr_logs.create({
        data: {
          bookingId: booking.id,
          customerId: booking.customerId,
          providerId: booking.providerId,
          action: "CHECK_IN",
          scannedBy: userId,
          scannedAt: now,
          metadata: JSON.stringify({ source: "provider_mobile" }),
        },
      });

      return tx.bookings.update({
        where: { id: booking.id },
        data: {
          status: "CHECKED_IN",
          checkedInAt: now,
        },
        include: BOOKING_INCLUDE,
      });
    });

    await notificationService.safeCreate({
      userId: updatedBooking.customer.users.id,
      type: "BOOKING_CHECKED_IN",
      title: "Checked in",
      message: `Your booking at ${updatedBooking.provider.businessName} was checked in.`,
      data: { bookingId: updatedBooking.id },
    });

    return updatedBooking;
  },

  async checkOut(req: Request) {
    const userId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const provider = await getOperatingProviderByUserId(userId);
    const qrPayload = verifyBookingQrToken(getQrToken(req));

    const booking = await prisma.bookings.findUnique({ where: { id } });
    if (!booking || booking.providerId !== provider.id) {
      throw new NotFoundException("Booking not found");
    }

    if (
      qrPayload.bookingId !== booking.id ||
      qrPayload.customerId !== booking.customerId ||
      qrPayload.providerId !== booking.providerId ||
      qrPayload.action !== "CHECK_OUT"
    ) {
      throw new BadRequestException("QR token does not match this booking");
    }

    if (booking.status !== "CHECKED_IN") {
      throw new BadRequestException(
        "Only CHECKED_IN bookings can be checked out",
      );
    }

    const now = new Date();

    const updatedBooking = await prisma.$transaction(async (tx) => {
      await tx.booking_qr_logs.create({
        data: {
          bookingId: booking.id,
          customerId: booking.customerId,
          providerId: booking.providerId,
          action: "CHECK_OUT",
          scannedBy: userId,
          scannedAt: now,
          metadata: JSON.stringify({ source: "provider_mobile" }),
        },
      });

      return tx.bookings.update({
        where: { id: booking.id },
        data: {
          status: "CHECKED_OUT",
          checkedOutAt: now,
        },
        include: BOOKING_INCLUDE,
      });
    });

    await notificationService.safeCreate({
      userId: updatedBooking.customer.users.id,
      type: "BOOKING_CHECKED_OUT",
      title: "Checked out",
      message: `Your booking at ${updatedBooking.provider.businessName} was checked out.`,
      data: { bookingId: updatedBooking.id },
    });

    return updatedBooking;
  },
};
