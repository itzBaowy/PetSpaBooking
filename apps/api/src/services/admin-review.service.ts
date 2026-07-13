import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../connect.prisma.ts";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.ts";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../common/helpers/exception.helper.ts";
import { adminAuditLogService } from "./admin-audit-log.service.ts";

const REVIEW_INCLUDE = {
  customers: {
    include: {
      users: {
        select: {
          id: true,
          userName: true,
          fullName: true,
          avatar: true,
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
      slug: true,
      providerStatus: true,
    },
  },
  booking: {
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      appointmentStart: true,
      totalAmount: true,
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

function getObjectIdQuery(value: unknown, name: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestException(`${name} must be a valid ObjectId`);
  }

  return value;
}

function getBooleanQuery(value: unknown, name: string) {
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new BadRequestException(`${name} must be true or false`);
}

function getOptionalReason(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestException("reason must be a non-empty string");
  }

  return value.trim();
}

export const adminReviewService = {
  async getAll(req: Request) {
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    const providerId = getObjectIdQuery(req.query.providerId, "providerId");
    const customerId = getObjectIdQuery(req.query.customerId, "customerId");
    const isHiddenByAdmin = getBooleanQuery(
      req.query.isHiddenByAdmin,
      "isHiddenByAdmin",
    );

    if (providerId) where.providerId = providerId;
    if (customerId) where.customerId = customerId;
    if (isHiddenByAdmin !== undefined) where.isHiddenByAdmin = isHiddenByAdmin;

    const [totalItems, items] = await Promise.all([
      prisma.reviews.count({ where }),
      prisma.reviews.findMany({
        where,
        include: REVIEW_INCLUDE,
        skip: index,
        take: pageSize,
        orderBy: { createAt: "desc" },
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
    const review = await prisma.reviews.findUnique({
      where: { id },
      include: REVIEW_INCLUDE,
    });

    if (!review) throw new NotFoundException("Review not found");
    return review;
  },

  async hide(req: Request) {
    const adminId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const reason = getOptionalReason(req.body?.reason);

    if (!reason) {
      throw new BadRequestException("reason is required");
    }

    const review = await prisma.reviews.update({
      where: { id },
      data: {
        isHiddenByAdmin: true,
        adminNote: reason,
      },
      include: REVIEW_INCLUDE,
    }).catch(() => null);

    if (!review) throw new NotFoundException("Review not found");

    await adminAuditLogService.safeLog({
      adminId,
      action: "REVIEW_HIDE",
      targetType: "REVIEW",
      targetId: review.id,
      metadata: {
        providerId: review.providerId,
        customerId: review.customerId,
        bookingId: review.bookingId,
        reason,
      },
    });

    return review;
  },

  async unhide(req: Request) {
    const adminId = getRequesterId(req);
    const id = getRouteParam(req, "id");
    const reason = getOptionalReason(req.body?.reason);

    const review = await prisma.reviews.update({
      where: { id },
      data: {
        isHiddenByAdmin: false,
        adminNote: reason,
      },
      include: REVIEW_INCLUDE,
    }).catch(() => null);

    if (!review) throw new NotFoundException("Review not found");

    await adminAuditLogService.safeLog({
      adminId,
      action: "REVIEW_UNHIDE",
      targetType: "REVIEW",
      targetId: review.id,
      metadata: {
        providerId: review.providerId,
        customerId: review.customerId,
        bookingId: review.bookingId,
        reason,
      },
    });

    return review;
  },
};
