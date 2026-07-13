import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../../connect.prisma.ts";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/helpers/exception.helper.ts";

const SLOT_STEP_MINUTES = 30;
const BOOKING_BLOCKING_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN"];

type TimeRange = {
  start: Date;
  end: Date;
};

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

function parseDate(value: unknown, fieldName: string): Date {
  if (typeof value !== "string" || !value) {
    throw new BadRequestException(`${fieldName} is required`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${fieldName} must be a valid date`);
  }

  return date;
}

function parseDateOnly(value: unknown): Date {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException("date must be in YYYY-MM-DD format");
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException("date must be a valid date");
  }

  return date;
}

function parseTime(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    throw new BadRequestException(`${fieldName} must be in HH:mm format`);
  }

  const [hour, minute] = value.split(":").map(Number);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new BadRequestException(`${fieldName} must be a valid HH:mm value`);
  }

  return value;
}

function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function setDateTime(date: Date, time: string): Date {
  const [hour, minute] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function dayRange(date: Date): TimeRange {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && a.end > b.start;
}

async function getProviderByRequester(userId: string) {
  const provider = await prisma.providers.findUnique({ where: { userId } });
  if (!provider) throw new ForbiddenException("Provider profile not found");
  return provider;
}

async function ensureProviderExists(providerId: string) {
  const provider = await prisma.providers.findUnique({
    where: { id: providerId },
    select: {
      id: true,
      providerStatus: true,
    },
  });

  if (!provider || provider.providerStatus !== "VERIFIED") {
    throw new NotFoundException("Provider not found");
  }

  return provider;
}

async function findSlotConflicts(providerId: string, start: Date, end: Date) {
  const [booking, block] = await Promise.all([
    prisma.bookings.findFirst({
      where: {
        providerId,
        status: { in: BOOKING_BLOCKING_STATUSES },
        appointmentStart: { lt: end },
        appointmentEnd: { gt: start },
      },
      select: {
        id: true,
        status: true,
        appointmentStart: true,
        appointmentEnd: true,
      },
    }),
    prisma.provider_availability_blocks.findFirst({
      where: {
        providerId,
        startAt: { lt: end },
        endAt: { gt: start },
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        reason: true,
      },
    }),
  ]);

  return { booking, block };
}

export async function assertProviderSlotAvailable(
  providerId: string,
  start: Date,
  end: Date,
) {
  if (end <= start) {
    throw new BadRequestException("appointmentEnd must be after appointmentStart");
  }

  const workingHour = await prisma.working_hours.findFirst({
    where: {
      providerId,
      dayOfWeek: start.getDay(),
    },
  });

  if (!workingHour || workingHour.isClosed) {
    throw new BadRequestException("Provider is closed on this day");
  }

  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const openMinutes = toMinutes(workingHour.openTime);
  const closeMinutes = toMinutes(workingHour.closeTime);

  if (
    end.getDate() !== start.getDate() ||
    startMinutes < openMinutes ||
    endMinutes > closeMinutes
  ) {
    throw new BadRequestException("Booking is outside provider working hours");
  }

  const conflicts = await findSlotConflicts(providerId, start, end);
  if (conflicts.block) {
    throw new BadRequestException("Provider is unavailable at this time");
  }

  if (conflicts.booking) {
    throw new BadRequestException("Provider already has a booking at this time");
  }
}

export const mobileAvailabilityService = {
  async getWorkingHours(req: Request) {
    const userId = getRequesterId(req);
    const provider = await getProviderByRequester(userId);

    return prisma.working_hours.findMany({
      where: { providerId: provider.id },
      orderBy: { dayOfWeek: "asc" },
    });
  },

  async updateWorkingHours(req: Request) {
    const userId = getRequesterId(req);
    const provider = await getProviderByRequester(userId);
    const { items } = req.body as {
      items?: Array<{
        dayOfWeek?: number;
        openTime?: string;
        closeTime?: string;
        isClosed?: boolean;
      }>;
    };

    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException("items must be a non-empty array");
    }

    const normalized = items.map((item) => {
      if (
        typeof item.dayOfWeek !== "number" ||
        !Number.isInteger(item.dayOfWeek) ||
        item.dayOfWeek < 0 ||
        item.dayOfWeek > 6
      ) {
        throw new BadRequestException("dayOfWeek must be an integer from 0 to 6");
      }

      const isClosed = item.isClosed === true;
      const openTime = parseTime(item.openTime ?? "00:00", "openTime");
      const closeTime = parseTime(item.closeTime ?? "00:00", "closeTime");

      if (!isClosed && toMinutes(openTime) >= toMinutes(closeTime)) {
        throw new BadRequestException("openTime must be before closeTime");
      }

      return {
        providerId: provider.id,
        dayOfWeek: item.dayOfWeek,
        openTime,
        closeTime,
        isClosed,
      };
    });

    const duplicatedDay = normalized.find(
      (item, index) =>
        normalized.findIndex((candidate) => candidate.dayOfWeek === item.dayOfWeek) !==
        index,
    );
    if (duplicatedDay) {
      throw new BadRequestException("dayOfWeek must be unique in items");
    }

    await prisma.$transaction(async (tx) => {
      await tx.working_hours.deleteMany({
        where: { providerId: provider.id },
      });
      await tx.working_hours.createMany({
        data: normalized,
      });
    });

    return prisma.working_hours.findMany({
      where: { providerId: provider.id },
      orderBy: { dayOfWeek: "asc" },
    });
  },

  async getBlocks(req: Request) {
    const userId = getRequesterId(req);
    const provider = await getProviderByRequester(userId);

    return prisma.provider_availability_blocks.findMany({
      where: { providerId: provider.id },
      orderBy: { startAt: "asc" },
    });
  },

  async createBlock(req: Request) {
    const userId = getRequesterId(req);
    const provider = await getProviderByRequester(userId);
    const { startAt, endAt, reason } = req.body as {
      startAt?: string;
      endAt?: string;
      reason?: string;
    };

    const start = parseDate(startAt, "startAt");
    const end = parseDate(endAt, "endAt");

    if (end <= start) {
      throw new BadRequestException("endAt must be after startAt");
    }

    const conflicts = await findSlotConflicts(provider.id, start, end);

    if (conflicts.block) {
      throw new BadRequestException("Availability block overlaps an existing block");
    }

    if (conflicts.booking) {
      throw new BadRequestException(
        "Cannot create availability block while an active booking overlaps this time range",
      );
    }

    return prisma.provider_availability_blocks.create({
      data: {
        providerId: provider.id,
        startAt: start,
        endAt: end,
        reason: reason ?? null,
      },
    });
  },

  async deleteBlock(req: Request) {
    const userId = getRequesterId(req);
    const provider = await getProviderByRequester(userId);
    const id = getRouteParam(req, "id");

    const deleted = await prisma.provider_availability_blocks.deleteMany({
      where: {
        id,
        providerId: provider.id,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException("Availability block not found");
    }

    return { id };
  },

  async getAvailableSlots(req: Request) {
    const providerId = getRouteParam(req, "providerId");
    const serviceId = req.query.serviceId;
    const date = parseDateOnly(req.query.date);

    if (typeof serviceId !== "string" || !ObjectId.isValid(serviceId)) {
      throw new BadRequestException("Valid serviceId is required");
    }

    await ensureProviderExists(providerId);

    const service = await prisma.services.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        providerId: true,
        duration: true,
        isActive: true,
        isHiddenByAdmin: true,
      },
    });

    if (
      !service ||
      service.providerId !== providerId ||
      !service.isActive ||
      service.isHiddenByAdmin
    ) {
      throw new NotFoundException("Service not found for this provider");
    }

    const workingHour = await prisma.working_hours.findFirst({
      where: {
        providerId,
        dayOfWeek: date.getDay(),
      },
    });

    if (!workingHour || workingHour.isClosed) {
      return {
        providerId,
        serviceId,
        date: req.query.date,
        durationMinutes: service.duration,
        slots: [],
      };
    }

    const workingStart = setDateTime(date, workingHour.openTime);
    const workingEnd = setDateTime(date, workingHour.closeTime);
    const day = dayRange(date);

    const [bookings, blocks] = await Promise.all([
      prisma.bookings.findMany({
        where: {
          providerId,
          status: { in: BOOKING_BLOCKING_STATUSES },
          appointmentStart: { lt: day.end },
          appointmentEnd: { gt: day.start },
        },
        select: {
          appointmentStart: true,
          appointmentEnd: true,
        },
      }),
      prisma.provider_availability_blocks.findMany({
        where: {
          providerId,
          startAt: { lt: day.end },
          endAt: { gt: day.start },
        },
        select: {
          startAt: true,
          endAt: true,
        },
      }),
    ]);

    const unavailableRanges = [
      ...bookings.map((booking) => ({
        start: booking.appointmentStart,
        end: booking.appointmentEnd,
      })),
      ...blocks.map((block) => ({
        start: block.startAt,
        end: block.endAt,
      })),
    ];

    const slots: Array<{ startAt: string; endAt: string }> = [];
    for (
      let cursor = new Date(workingStart);
      cursor.getTime() + service.duration * 60_000 <= workingEnd.getTime();
      cursor = new Date(cursor.getTime() + SLOT_STEP_MINUTES * 60_000)
    ) {
      const slot = {
        start: cursor,
        end: new Date(cursor.getTime() + service.duration * 60_000),
      };

      const isPast = slot.start.getTime() <= Date.now();
      const hasConflict = unavailableRanges.some((range) => overlaps(slot, range));

      if (!isPast && !hasConflict) {
        slots.push({
          startAt: slot.start.toISOString(),
          endAt: slot.end.toISOString(),
        });
      }
    }

    return {
      providerId,
      serviceId,
      date: req.query.date,
      durationMinutes: service.duration,
      workingHours: {
        openTime: workingHour.openTime,
        closeTime: workingHour.closeTime,
      },
      slots,
    };
  },
};
